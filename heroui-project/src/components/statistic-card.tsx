import React from "react";
import { Card, CardBody } from "@heroui/react";

interface StatisticCardProps {
  title: string;
  value: string;
  change?: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ title, value, change }) => {
  return (
    <Card shadow="none" className="p-0 border border-gray-200">
      <CardBody className="p-6">
        <div className="text-sm text-gray-600 mb-2">{title}</div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        {change && <div className="text-sm text-green-500">{change}</div>}
      </CardBody>
    </Card>
  );
};

export default StatisticCard;