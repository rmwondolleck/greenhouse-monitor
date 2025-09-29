import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Wifi, WifiOff, Leaf, Sun, CloudRain, Sprout, Cpu, HardDrive, Activity } from 'lucide-react';
import HistoricalChart from './HistoricalChart';

export default function GreenhouseMonitor() {
    const [data, setData] = useState({
        temperature: null,
        humidity: null,
        lastUpdated: null
    });
    const [systemStats, setSystemStats] = useState({
        cpuTemp: null,
        cpuTempF: null,
        cpuUsage: null,
        memoryUsage: null,
        diskUsage: null,
        overheat: false
    });
    const [historicalData, setHistoricalData] = useState([]);
    const [chartHours, setChartHours] = useState(24);
    const [isConnected, setIsConnected] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data from your Node.js backend
    const fetchSensorData = async () => {
        try {
            const response = await fetch('/api/sensor-data');
            const sensorData = await response.json();

            setData({
                temperature: sensorData.temperature,
                humidity: sensorData.humidity,
                lastUpdated: sensorData.lastUpdated
            });
            setIsConnected(sensorData.status === 'connected');
            setError(null);
        } catch (err) {
            setError('Failed to fetch greenhouse sensor data');
            setIsConnected(false);
        }
    };

    // Fetch Pi system stats
    const fetchSystemStats = async () => {
        try {
            const response = await fetch('/api/system-stats');
            const stats = await response.json();
            setSystemStats(stats);
        } catch (err) {
            console.error('Failed to fetch system stats:', err);
        }
    };

    // Fetch historical data
    const fetchHistoricalData = async (hours = chartHours) => {
        try {
            const response = await fetch(`/api/historical-data?hours=${hours}`);
            const result = await response.json();

            // Transform data for chart
            const chartData = result.data.map(point => ({
                time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: point.timestamp,
                temperature: parseFloat(point.temperature),
                humidity: parseFloat(point.humidity),
                cpuTemp: point.cpuTemp ? parseFloat(point.cpuTemp) : null
            }));

            setHistoricalData(chartData);
        } catch (err) {
            console.error('Failed to fetch historical data:', err);
        }
    };

    useEffect(() => {
        fetchSensorData();
        fetchSystemStats();
        fetchHistoricalData();

        const sensorInterval = setInterval(fetchSensorData, 5000);
        const systemInterval = setInterval(fetchSystemStats, 30000);
        const historyInterval = setInterval(() => fetchHistoricalData(), 60000); // Update chart every minute

        return () => {
            clearInterval(sensorInterval);
            clearInterval(systemInterval);
            clearInterval(historyInterval);
        };
    }, [chartHours]);

    const formatTime = (isoString) => {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleTimeString();
    };

    const getTemperatureStatus = (temp) => {
        const t = parseFloat(temp);
        if (t < 60) return { color: 'text-blue-600', status: 'Too Cold', bg: 'bg-blue-50', icon: '🥶' };
        if (t < 70) return { color: 'text-cyan-600', status: 'Cool', bg: 'bg-cyan-50', icon: '❄️' };
        if (t < 80) return { color: 'text-green-600', status: 'Optimal', bg: 'bg-green-50', icon: '🌱' };
        if (t < 90) return { color: 'text-yellow-600', status: 'Warm', bg: 'bg-yellow-50', icon: '☀️' };
        return { color: 'text-red-600', status: 'Too Hot', bg: 'bg-red-50', icon: '🔥' };
    };

    const getHumidityStatus = (humidity) => {
        const h = parseFloat(humidity);
        if (h < 40) return { color: 'text-red-600', status: 'Too Dry', bg: 'bg-red-50', icon: '🏜️' };
        if (h < 60) return { color: 'text-green-600', status: 'Optimal', bg: 'bg-green-50', icon: '🌿' };
        if (h < 80) return { color: 'text-blue-600', status: 'Humid', bg: 'bg-blue-50', icon: '💧' };
        return { color: 'text-purple-600', status: 'Too Humid', bg: 'bg-purple-50', icon: '🌊' };
    };

    const tempStatus = data.temperature ? getTemperatureStatus(data.temperature) : null;
    const humidityStatus = data.humidity ? getHumidityStatus(data.humidity) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 p-4">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 text-6xl opacity-10">🌱</div>
                <div className="absolute top-40 right-20 text-4xl opacity-10">🍃</div>
                <div className="absolute bottom-32 left-20 text-5xl opacity-10">🌿</div>
                <div className="absolute bottom-20 right-16 text-3xl opacity-10">🥬</div>
                <div className="absolute top-60 left-1/3 text-4xl opacity-10">🌾</div>
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-4 bg-green-600 rounded-full shadow-lg mr-4">
                            <Leaf className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold text-green-800 mb-2">
                                Greenhouse Monitor
                            </h1>
                            <p className="text-green-600 text-lg">Environmental Control System</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-sm">
                        {isConnected ? (
                            <>
                                <Wifi className="w-4 h-4 text-green-600" />
                                <span className="text-green-700 font-medium">System Online</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-4 h-4 text-red-500" />
                                <span className="text-red-600 font-medium">System Offline</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-md">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">⚠️</span>
                            <div>
                                <p className="font-semibold">Sensor Alert</p>
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Data Cards */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Temperature Card */}
                    <div className={`bg-white rounded-3xl shadow-xl p-8 border-2 border-green-200 ${tempStatus?.bg || ''} transition-all duration-300`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-lg">
                                    <Thermometer className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Temperature</h2>
                                    <p className="text-sm text-gray-600">Greenhouse Climate</p>
                                </div>
                            </div>
                            {tempStatus && (
                                <div className="text-4xl">{tempStatus.icon}</div>
                            )}
                        </div>

                        <div className="text-center mb-4">
                            <div className={`text-7xl font-bold mb-2 ${tempStatus?.color || 'text-gray-400'}`}>
                                {data.temperature || '--'}
                                <span className="text-3xl">°F</span>
                            </div>
                            <div className="text-lg text-gray-600 mb-2">
                                {data.temperature ? `${((parseFloat(data.temperature) - 32) * 5/9).toFixed(1)}°C` : '--°C'}
                            </div>
                            {tempStatus && (
                                <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${tempStatus.color} ${tempStatus.bg} border border-current border-opacity-20`}>
                                    {tempStatus.status}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Humidity Card */}
                    <div className={`bg-white rounded-3xl shadow-xl p-8 border-2 border-green-200 ${humidityStatus?.bg || ''} transition-all duration-300`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-4 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl shadow-lg">
                                    <Droplets className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Humidity</h2>
                                    <p className="text-sm text-gray-600">Moisture Level</p>
                                </div>
                            </div>
                            {humidityStatus && (
                                <div className="text-4xl">{humidityStatus.icon}</div>
                            )}
                        </div>

                        <div className="text-center mb-4">
                            <div className={`text-7xl font-bold mb-2 ${humidityStatus?.color || 'text-gray-400'}`}>
                                {data.humidity || '--'}
                                <span className="text-3xl">%</span>
                            </div>
                            <div className="text-lg text-gray-600 mb-2">
                                Relative Humidity
                            </div>
                            {humidityStatus && (
                                <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${humidityStatus.color} ${humidityStatus.bg} border border-current border-opacity-20`}>
                                    {humidityStatus.status}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Growing Conditions Summary */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-green-200 mb-8">
                    <div className="flex items-center mb-6">
                        <div className="p-3 bg-green-500 rounded-2xl mr-4">
                            <Sprout className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">Growing Conditions</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-4 rounded-xl bg-green-50">
                            <Sun className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                            <p className="font-semibold text-gray-800">Temperature</p>
                            <p className={`text-sm font-medium ${tempStatus?.color || 'text-gray-500'}`}>
                                {tempStatus?.status || 'Monitoring...'}
                            </p>
                        </div>

                        <div className="text-center p-4 rounded-xl bg-blue-50">
                            <CloudRain className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <p className="font-semibold text-gray-800">Humidity</p>
                            <p className={`text-sm font-medium ${humidityStatus?.color || 'text-gray-500'}`}>
                                {humidityStatus?.status || 'Monitoring...'}
                            </p>
                        </div>

                        <div className="text-center p-4 rounded-xl bg-emerald-50">
                            <Leaf className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                            <p className="font-semibold text-gray-800">Overall</p>
                            <p className={`text-sm font-medium ${
                                (tempStatus?.status === 'Optimal' && humidityStatus?.status === 'Optimal')
                                    ? 'text-green-600'
                                    : 'text-yellow-600'
                            }`}>
                                {(tempStatus?.status === 'Optimal' && humidityStatus?.status === 'Optimal')
                                    ? 'Perfect Growth'
                                    : 'Needs Attention'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Historical Data Chart */}
                {/* Historical Data Chart */}
                <HistoricalChart
                    data={historicalData}
                    selectedHours={chartHours}
                    onTimeRangeChange={(hours) => setChartHours(hours)}
                />

                {/* Pi System Monitoring */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-green-200 mb-8">
                    <div className="flex items-center mb-6">
                        <div className="p-3 bg-purple-500 rounded-2xl mr-4">
                            <Cpu className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">Raspberry Pi Status</h3>
                            <p className="text-gray-600">System Health Monitoring</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        <div className={`text-center p-4 rounded-xl ${systemStats.overheat ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}>
                            <Thermometer className={`w-8 h-8 mx-auto mb-2 ${systemStats.overheat ? 'text-red-500' : 'text-purple-500'}`} />
                            <p className="font-semibold text-gray-800">CPU Temp</p>
                            <p className={`text-lg font-bold ${systemStats.overheat ? 'text-red-600' : 'text-gray-700'}`}>
                                {systemStats.cpuTempF ? `${systemStats.cpuTempF}°F` : '--°F'}
                            </p>
                            <p className="text-sm text-gray-600">
                                {systemStats.cpuTemp ? `${systemStats.cpuTemp.toFixed(1)}°C` : '--°C'}
                            </p>
                        </div>

                        <div className="text-center p-4 rounded-xl bg-blue-50">
                            <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <p className="font-semibold text-gray-800">CPU Usage</p>
                            <p className="text-lg font-bold text-gray-700">
                                {systemStats.cpuUsage ? `${systemStats.cpuUsage.toFixed(1)}%` : '--%'}
                            </p>
                        </div>

                        <div className="text-center p-4 rounded-xl bg-green-50">
                            <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="font-semibold text-gray-800">Memory</p>
                            <p className="text-lg font-bold text-gray-700">
                                {systemStats.memoryUsage ? `${systemStats.memoryUsage.toFixed(1)}%` : '--%'}
                            </p>
                        </div>

                        <div className="text-center p-4 rounded-xl bg-yellow-50">
                            <HardDrive className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                            <p className="font-semibold text-gray-800">Disk Usage</p>
                            <p className="text-lg font-bold text-gray-700">
                                {systemStats.diskUsage ? `${systemStats.diskUsage}%` : '--%'}
                            </p>
                        </div>
                    </div>

                    {systemStats.overheat && (
                        <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                            <div className="flex items-center">
                                <span className="text-2xl mr-3">🚨</span>
                                <div>
                                    <p className="font-semibold">CPU Overheat Warning!</p>
                                    <p className="text-sm">CPU temperature is critically high. Consider improving cooling or reducing load.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                                <span className="font-semibold">Last Updated:</span> {formatTime(data.lastUpdated)}
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm text-gray-600">DHT11 Sensor</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${systemStats.overheat ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                <span className="text-sm text-gray-600">Pi Health</span>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-gray-500">Raspberry Pi 4</p>
                            <p className="text-xs text-gray-500">Greenhouse Control System</p>
                            <p className="text-xs text-gray-500">Data logging every 5 minutes</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}