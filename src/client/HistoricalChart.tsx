import React from 'react';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HistoricalDataPoint {
    time: string;
    timestamp: string;
    temperature: number;
    humidity: number;
    cpuTemp: number | null;
}

interface HistoricalChartProps {
    data: HistoricalDataPoint[];
    selectedHours: number;
    onTimeRangeChange: (hours: number) => void;
}

export default function HistoricalChart({ data, selectedHours, onTimeRangeChange }: HistoricalChartProps) {
    const timeRanges = [
        { label: '6h', hours: 6 },
        { label: '24h', hours: 24 },
        { label: '3d', hours: 72 },
        { label: '7d', hours: 168 }
    ];

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-green-200 mb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <div className="p-3 bg-indigo-500 rounded-2xl mr-4">
                        <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">Historical Data</h3>
                        <p className="text-gray-600">Temperature & Humidity Trends</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {timeRanges.map(({ label, hours }) => (
                        <button
                            key={hours}
                            onClick={() => onTimeRangeChange(hours)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                selectedHours === hours
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {data.length > 0 ? (
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="time"
                                stroke="#6b7280"
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                yAxisId="temp"
                                stroke="#ef4444"
                                tick={{ fontSize: 12 }}
                                label={{ value: 'Temperature (°F)', angle: -90, position: 'insideLeft' }}
                            />
                            <YAxis
                                yAxisId="humidity"
                                orientation="right"
                                stroke="#3b82f6"
                                tick={{ fontSize: 12 }}
                                label={{ value: 'Humidity (%)', angle: 90, position: 'insideRight' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '12px'
                                }}
                                formatter={(value, name) => {
                                    if (name === 'temperature') return [`${Number(value).toFixed(1)}°F`, 'Temperature'];
                                    if (name === 'humidity') return [`${Number(value).toFixed(1)}%`, 'Humidity'];
                                    return [value, name];
                                }}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="line"
                            />
                            <Line
                                yAxisId="temp"
                                type="monotone"
                                dataKey="temperature"
                                stroke="#ef4444"
                                strokeWidth={2}
                                dot={false}
                                name="Temperature"
                            />
                            <Line
                                yAxisId="humidity"
                                type="monotone"
                                dataKey="humidity"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                                name="Humidity"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-xl">
                    <div className="text-center">
                        <p className="text-gray-500 text-lg mb-2">📊 No historical data available yet</p>
                        <p className="text-gray-400 text-sm">Data will appear after first save cycle</p>
                    </div>
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div>
                        <span className="font-semibold">Data Points:</span> {data.length}
                    </div>
                    <div>
                        <span className="font-semibold">Time Range:</span> {selectedHours} hours
                    </div>
                    {data.length > 0 && (
                        <div>
                            <span className="font-semibold">Latest:</span> {new Date(data[data.length - 1]?.timestamp).toLocaleString()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}