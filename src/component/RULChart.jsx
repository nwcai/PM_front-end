import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation"; // Import annotation plugin
import zoomPlugin from "chartjs-plugin-zoom"; // Import zoom plugin

// ลงทะเบียน components และ plugins ของ Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    annotationPlugin,
    zoomPlugin // ลงทะเบียน zoom plugin
);

const BASE_URL = "http://localhost:3000/api/machine"; // เปลี่ยนเป็น URL ของ API จริง

const fetchMachineData = async (id) => {
    console.log("fetchMachineData called with id:", id); // Debugging log
    try {
        const response = await axios.get(`${BASE_URL}/id/${id}`);
        console.log("Machine Data:", response.data);
        if (response.data && response.data.length > 0) {
            return response.data[0]; // Return the first machine object
        } else {
            console.error("No machine data found for id:", id);
            return {}; // Return an empty object if no data is found
        }
    } catch (error) {
        console.error("Error fetching machine data:", error);
        throw error;
    }
};

const fetchEventsAndRepairs = async (id_machine, create_date) => {
    console.log("fetchEventsAndRepairs called with id_machine:", id_machine); // Debugging log
    try {
        const response = await axios.get(`${BASE_URL}/event/${id_machine}`);
        console.log("Events Data from API:", response.data);

        const mappedEvents = response.data.map(event => ({
            time: (new Date(event.timestamp) - new Date(create_date)) / (1000 * 60 * 60), // Convert to hours
            severity: event.severity,
            repairTime: event.repair_date ? (new Date(event.repair_date) - new Date(create_date)) / (1000 * 60 * 60) : null,
            repairEffectiveness: event.repair_effectiveness || 0.5,
            name: event.event_name || "Unnamed Event", // เพิ่มการกำหนดชื่อเหตุการณ์
        }));

        console.log("Mapped Events:", mappedEvents); // Debugging log
        return mappedEvents;
    } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
    }
};

const generateRULData = (timeToZero, events) => {
    const a = 100 / (timeToZero ** 2); // ค่าคงที่สำหรับการคำนวณ RUL
    const data = [];
    const baseRUL = []; // เก็บค่า Base RUL
    const eventPoints = []; // เก็บจุด event
    const repairPoints = []; // เก็บจุด repair

    for (let t = 0; t <= timeToZero; t += 0.1) {
        let RUL = 100 - a * (t ** 2); // คำนวณค่า RUL เบื้องต้น
        baseRUL.push({ time: t.toFixed(1), RUL }); // เก็บค่า Base RUL

        // ปรับค่า RUL ตามเหตุการณ์
        events.forEach(event => {
            if (t >= event.time) {
                const severityFactor = 1 + (event.severity / 20);
                const reduction = severityFactor * Math.sqrt(t - event.time);
                RUL -= Math.min(reduction, RUL * 0.3);
            }
            if (event.repairTime && t >= event.repairTime) {
                const relatedEventRUL = data.find(d => parseFloat(d.time) === parseFloat(event.time.toFixed(1)))?.RUL || 100;
                const maxRULAfterRepair = relatedEventRUL; // จำกัดค่า RUL หลัง repair ไม่เกินค่า Event ที่เกี่ยวข้อง
                const increase = (maxRULAfterRepair - RUL) * event.repairEffectiveness;
                RUL += Math.min(increase, maxRULAfterRepair - RUL); // จำกัดการเพิ่มค่า RUL
            }
        });

        RUL = Math.max(0, Math.min(100, RUL));
        data.push({ time: t.toFixed(1), RUL });
    }

    return { data, baseRUL, eventPoints, repairPoints };
};

const RULChart = ({ id, machineId }) => {
    const [timeToZero, setTimeToZero] = useState(12);
    const [events, setEvents] = useState([]);
    const [data, setData] = useState([]);
    const [baseRUL, setBaseRUL] = useState([]);
    const [eventPoints, setEventPoints] = useState([]);
    const [repairPoints, setRepairPoints] = useState([]);
    const [currentPosition, setCurrentPosition] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const machineData = await fetchMachineData(id);
                if (!machineData.id_machine || !machineData.create_date) return;

                const eventList = await fetchEventsAndRepairs(machineId, machineData.create_date);
                setTimeToZero(machineData.life_time);
                setEvents(eventList);

                const { data: generatedData, baseRUL: generatedBaseRUL, eventPoints: generatedEventPoints, repairPoints: generatedRepairPoints } = generateRULData(machineData.life_time, eventList);
                setData(generatedData);
                setBaseRUL(generatedBaseRUL);
                setEventPoints(generatedEventPoints);
                setRepairPoints(generatedRepairPoints);

                // คำนวณตำแหน่งปัจจุบัน
                const currentTime = (new Date() - new Date(machineData.create_date)) / (1000 * 60 * 60); // เวลาปัจจุบันในชั่วโมง
                const currentDataPoint = generatedData.find(d => parseFloat(d.time) >= currentTime);
                if (currentDataPoint) {
                    setCurrentPosition({
                        x: currentTime.toFixed(1),
                        y: currentDataPoint.RUL,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };
        fetchData();
    }, [id, machineId]);

    // เตรียมข้อมูลสำหรับ Chart.js
    const chartData = {
        labels: baseRUL.map(d => d.time), // แกน X
        datasets: [
            {
                label: "Base RUL (%)",
                data: baseRUL.map(d => d.RUL), // แกน Y
                borderColor: "#cccccc",
                backgroundColor: "rgba(200, 200, 200, 0.5)",
                tension: 0.4,
                borderWidth: 1, // ปรับขนาดเส้น Base RUL ให้บางลง
                pointRadius: 0, // เอาจุด Base RUL ออก
                order: 1, // กำหนดลำดับให้ Base RUL อยู่ด้านหลัง
            },
            ...(events.length > 0
                ? [
                      {
                          label: "RUL (%)",
                          data: data.map(d => d.RUL), // แกน Y
                          borderColor: "#8884d8",
                          backgroundColor: "rgba(136, 132, 216, 0.5)",
                          tension: 0.4,
                          borderWidth: 1, // ปรับขนาดเส้น RUL ให้บางลง
                          pointRadius: 0, // เอาจุด RUL ออก
                          order: 2, // กำหนดลำดับให้เส้น RUL อยู่ด้านหลัง
                      },
                      {
                          label: "Events",
                          data: eventPoints, // จุด event
                          borderColor: "red",
                          backgroundColor: "red",
                          type: "scatter", // ใช้ scatter สำหรับจุด event
                          pointRadius: 5,
                          order: 3, // กำหนดลำดับให้จุด Event อยู่ด้านหน้า
                      },
                      {
                          label: "Repairs",
                          data: repairPoints, // จุด repair
                          borderColor: "green",
                          backgroundColor: "green",
                          type: "scatter", // ใช้ scatter สำหรับจุด repair
                          pointRadius: 5,
                          order: 4, // กำหนดลำดับให้จุด Repair อยู่ด้านหน้า
                      },
                      {
                          label: "Current Position",
                          data: currentPosition ? [currentPosition] : [], // จุดตำแหน่งปัจจุบัน
                          borderColor: "blue",
                          backgroundColor: "blue",
                          type: "scatter", // ใช้ scatter สำหรับจุดตำแหน่งปัจจุบัน
                          pointRadius: 7,
                          order: 5, // กำหนดลำดับให้จุด Current อยู่ด้านหน้า
                      },
                  ]
                : []),
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            tooltip: {
                mode: "index",
                intersect: false,
                callbacks: {
                    label: function (context) {
                        if (context.dataset.label === "Events") {
                            const event = context.raw;
                            return `Event: ${event.name} (RUL: ${event.y}%)`;
                        }
                        if (context.dataset.label === "Repairs") {
                            const repair = context.raw;
                            return `Repair: ${repair.name} (RUL: ${repair.y}%)`;
                        }
                        if (context.dataset.label === "Current Position") {
                            return `Current Position: (RUL: ${context.raw.y}%)`;
                        }
                        return `${context.dataset.label}: ${context.raw}%`;
                    },
                },
            },
            annotation: {
                annotations: {
                    warningThreshold: {
                        type: "line",
                        yMin: 60,
                        yMax: 60,
                        borderColor: "orange",
                        borderWidth: 2,
                        label: {
                            content: "Warning Threshold (60%)",
                            enabled: true,
                            position: "end",
                        },
                    },
                    criticalThreshold: {
                        type: "line",
                        yMin: 40,
                        yMax: 40,
                        borderColor: "red",
                        borderWidth: 2,
                        label: {
                            content: "Critical Threshold (40%)",
                            enabled: true,
                            position: "end",
                        },
                    },
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Time (Hours)",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "RUL (%)",
                },
                min: 0,
                max: 100,
            },
        },
    };

    return (
        <div>
            <h2>RUL Prediction Chart</h2>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default RULChart;