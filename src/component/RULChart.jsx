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

const getSeverityFactor = (severity) => {
    if (severity >= 10) return 5.0;
    if (severity >= 9) return 3.0;
    if (severity >= 8) return 2.5;
    if (severity >= 7) return 2.0;
    if (severity >= 6) return 1.7;
    if (severity >= 5) return 1.5;
    if (severity >= 4) return 1.3;
    if (severity >= 3) return 1.2;
    if (severity >= 2) return 1.1;
    if (severity >= 1) return 1.05;
    return 1.0; // ถ้า Severity = 0 (ไม่มี Event) ใช้ค่าเริ่มต้น
};

const generateRULData = (timeToZero, events) => {
    const baseA = 100 / (timeToZero ** 2); // ค่าคงที่สำหรับการคำนวณ Base RUL
    const data = [];
    const baseRUL = []; // เก็บค่า Base RUL
    const eventPoints = []; // เก็บจุด event
    const repairPoints = []; // เก็บจุด repair

    for (let t = 0; t <= timeToZero; t += 0.1) {
        let RUL = 100 - baseA * (t ** 2); // คำนวณค่า Base RUL เบื้องต้น
        baseRUL.push({ time: t.toFixed(1), RUL }); // เก็บค่า Base RUL

        let adjustedA = baseA; // เริ่มต้นด้วยค่า Base A

        // สะสมผลกระทบจากทุก Event ที่เกิดขึ้นก่อนเวลา t
        events.forEach(event => {
            if (t >= event.time && (!event.repairTime || t < event.repairTime)) {
                const severityFactor = getSeverityFactor(event.severity);
                adjustedA *= severityFactor; // ปรับค่า A ตาม Severity Factor
            }
        });

        // คำนวณ RUL ใหม่โดยใช้ค่า adjustedA
        events.forEach(event => {
            if (t >= event.time && (!event.repairTime || t < event.repairTime)) {
                const reduction = adjustedA * (t - event.time) ** 2;
                RUL = Math.max(0, RUL - reduction); // ลดค่า RUL ตามผลกระทบของ Event
            }
        });

        // ปรับค่า RUL ตาม Repair
        events.forEach(event => {
            if (event.repairTime && t >= event.repairTime) {
                const relatedEventRUL = data.find(d => Math.abs(parseFloat(d.time) - parseFloat(event.time)) < 0.05)?.RUL || 100;
                const maxRULAfterRepair = relatedEventRUL; // จำกัดค่า RUL หลัง repair ไม่เกินค่า Event ที่เกี่ยวข้อง

                // คำนวณค่า Base RUL (RUL_normal) ในช่วงเวลานั้น
                const RUL_normal = 100 - baseA * (t ** 2);

                // เพิ่มค่า RUL หลังการซ่อม โดยจำกัดไม่ให้เกิน RUL_normal
                RUL = Math.min(RUL + (RUL_normal - RUL) * event.repairEffectiveness, RUL_normal);

                // ปรับค่า A หลังการซ่อม
                const aAfterRepair = adjustedA * (1 - event.repairEffectiveness);

                // ลดลงต่อเนื่องหลังการซ่อมโดยใช้ aAfterRepair
                if (t > event.repairTime) {
                    const postRepairReduction = aAfterRepair * (t - event.repairTime) ** 2;
                    RUL = Math.max(0, RUL - postRepairReduction);
                }
            }
        });

        RUL = Math.max(0, Math.min(100, RUL)); // จำกัดค่า RUL ให้อยู่ในช่วง 0-100
        data.push({ time: t.toFixed(1), RUL });
    }

    // เพิ่มจุด Event และ Repair
    events.forEach(event => {
        // เพิ่มจุด Event
        if (event.time) {
            const matchingDataPoint = data.find(d => Math.abs(parseFloat(d.time) - parseFloat(event.time)) < 0.05);
            if (matchingDataPoint) {
                eventPoints.push({
                    x: parseFloat(event.time).toFixed(1),
                    y: matchingDataPoint.RUL,
                    name: event.name || "Unnamed Event", // ชื่อ Event
                });
            }
        }

        // เพิ่มจุด Repair
        if (event.repairTime) {
            const matchingRepairPoint = data.find(d => Math.abs(parseFloat(d.time) - parseFloat(event.repairTime)) < 0.05);
            if (matchingRepairPoint) {
                repairPoints.push({
                    x: parseFloat(event.repairTime).toFixed(1),
                    y: matchingRepairPoint.RUL,
                    name: "Repair Point", // ชื่อ Repair
                });
            }
        }
    });

    return { data, baseRUL, eventPoints, repairPoints };
};

const calculateTimeToThreshold = (data, threshold) => {
    const thresholdPoint = data.find(d => d.RUL <= threshold); // ค้นหาค่าที่ RUL <= threshold
    if (thresholdPoint) {
        return parseFloat(thresholdPoint.time).toFixed(1); // คืนค่าเวลาในรูปแบบทศนิยม 1 ตำแหน่ง
    }
    return null; // หากไม่มีค่า RUL ที่ต่ำกว่า threshold
};

const RULChart = ({ id, machineId }) => {
    const [timeToZero, setTimeToZero] = useState(12);
    const [events, setEvents] = useState([]);
    const [data, setData] = useState([]);
    const [baseRUL, setBaseRUL] = useState([]);
    const [eventPoints, setEventPoints] = useState([]);
    const [repairPoints, setRepairPoints] = useState([]);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [machineData, setMachineData] = useState(null); // เพิ่ม state สำหรับ machineData

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedMachineData = await fetchMachineData(id);
                if (!fetchedMachineData.id_machine || !fetchedMachineData.create_date) return;
                setMachineData(fetchedMachineData);

                const eventList = await fetchEventsAndRepairs(machineId, fetchedMachineData.create_date);
                setTimeToZero(fetchedMachineData.life_time);
                setEvents(eventList);

                const { data: generatedData, baseRUL: generatedBaseRUL, eventPoints: generatedEventPoints, repairPoints: generatedRepairPoints } = generateRULData(fetchedMachineData.life_time, eventList);
                setData(generatedData);
                setBaseRUL(generatedBaseRUL);
                setEventPoints(generatedEventPoints);
                setRepairPoints(generatedRepairPoints);

                // คำนวณเวลาที่เหลือถึง Threshold
                const timeToWarning = calculateTimeToThreshold(generatedData, 50); // Warning Threshold
                const timeToCritical = calculateTimeToThreshold(generatedData, 30); // Critical Threshold
                console.log(`Time to Warning Threshold: ${timeToWarning} hours`);
                console.log(`Time to Critical Threshold: ${timeToCritical} hours`);

                // คำนวณตำแหน่งปัจจุบัน
                const currentTime = (new Date() - new Date(fetchedMachineData.create_date)) / (1000 * 60 * 60); // เวลาปัจจุบันในชั่วโมง
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
                  ]
                : []),
            {
                label: "Current Position",
                data: currentPosition ? [currentPosition] : [], // จุดตำแหน่งปัจจุบัน
                borderColor: "blue",
                backgroundColor: "blue",
                type: "scatter", // ใช้ scatter สำหรับจุดตำแหน่งปัจจุบัน
                pointRadius: 7,
                order: 5, // กำหนดลำดับให้จุด Current อยู่ด้านหน้า
            },
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
                        yMin: 50, // ค่า Y ของ Warning Threshold
                        yMax: 50, // ค่า Y ของ Warning Threshold
                        borderColor: "orange",
                        borderWidth: 2,
                        label: {
                            content: "Warning Threshold (50%)",
                            enabled: true,
                            position: "end",
                            backgroundColor: "rgba(255, 165, 0, 0.5)",
                        },
                    },
                    criticalThreshold: {
                        type: "line",
                        yMin: 30, // ค่า Y ของ Critical Threshold
                        yMax: 30, // ค่า Y ของ Critical Threshold
                        borderColor: "red",
                        borderWidth: 2,
                        label: {
                            content: "Critical Threshold (30%)",
                            enabled: true,
                            position: "end",
                            backgroundColor: "rgba(255, 0, 0, 0.5)",
                        },
                    },
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Date",
                },
                ticks: {
                    callback: function (value, index, values) {
                        if (!machineData) return "";
                        const date = new Date(baseRUL[index]?.time * 60 * 60 * 1000 + new Date(machineData.create_date).getTime());
                        return date.toISOString().split("T")[0];
                    },
                    autoSkip: true,
                    maxRotation: 45,
                    minRotation: 0,
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

    const convertHoursToMonthsAndDays = (hours) => {
        if (!hours) return "N/A"; // หากไม่มีค่า ให้แสดง "N/A"
        const days = Math.floor(hours / 24); // แปลงชั่วโมงเป็นวัน
        const months = Math.floor(days / 30); // แปลงวันเป็นเดือน (โดยประมาณ 1 เดือน = 30 วัน)
        const remainingDays = days % 30; // คำนวณวันที่เหลือหลังจากแปลงเป็นเดือน
        return `${months} month(s) and ${remainingDays} day(s)`; // คืนค่าในรูปแบบ "กี่เดือน กี่วัน"
    };

    return (
        <div>
            <Line data={chartData} options={options} />
            <p>
                Time to Warning Threshold (50%):{" "}
                {convertHoursToMonthsAndDays(calculateTimeToThreshold(data, 50))}
            </p>
            <p>
                Time to Critical Threshold (30%):{" "}
                {convertHoursToMonthsAndDays(calculateTimeToThreshold(data, 30))}
            </p>
        </div>
    );
};

export default RULChart;