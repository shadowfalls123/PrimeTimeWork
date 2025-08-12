import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  Calendar,
  BarChart3,
  Users,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DashboardStats {
  coursesCompleted: number;
  totalCourses: number;
  averageScore: number;
  percentile: number;
  streak: number;
  hoursStudied: number;
}

interface ProgressData {
  name: string;
  completed: number;
  score: number;
}

interface ComparisonData {
  name: string;
  value: number;
}

const StudentDashboardNew: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    coursesCompleted: 12,
    totalCourses: 15,
    averageScore: 92,
    percentile: 98,
    streak: 7,
    hoursStudied: 45
  });

  const [progressData] = useState<ProgressData[]>([
    { name: "Jan", completed: 4, score: 85 },
    { name: "Feb", completed: 7, score: 88 },
    { name: "Mar", completed: 10, score: 90 },
    { name: "Apr", completed: 8, score: 87 },
    { name: "May", completed: 11, score: 92 },
    { name: "Jun", completed: 12, score: 94 },
  ]);

  const [comparisonData] = useState<ComparisonData[]>([
    { name: "Your Score", value: 92 },
    { name: "Average Score", value: 75 },
  ]);

  const [recentActivities] = useState([
    { id: 1, type: "exam", title: "Mathematics Final", score: 95, date: "2 days ago" },
    { id: 2, type: "course", title: "Physics Chapter 5", progress: 100, date: "3 days ago" },
    { id: 3, type: "exam", title: "Chemistry Quiz", score: 88, date: "1 week ago" },
    { id: 4, type: "course", title: "Biology Lab", progress: 75, date: "1 week ago" },
  ]);

  const completionPercentage = Math.round((stats.coursesCompleted / stats.totalCourses) * 100);
  const topPercentage = 100 - stats.percentile;

  const pieColors = ["#8FBC8F", "#d4a574", "#e5e7eb"];

  return (
    <div className="container-padding content-max-width py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
        <p className="text-gray-600">Track your learning progress and achievements</p>
      </div>

      {/* Motivational Banner */}
      <Card className="mb-8 bg-gradient-to-r from-sage-50 to-wood-50 border-sage-200">
        <CardContent className="py-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-sage-500 rounded-full">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                🎉 You're doing amazing!
              </h2>
              <p className="text-gray-700 mb-2">
                You've completed {completionPercentage}% of your courses! Keep up the momentum to reach your goals.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-sage-600" />
                  <span className="text-gray-600">
                    Top {topPercentage}% performer with an average score of {stats.averageScore}%
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-wood-600" />
                  <span className="text-gray-600">
                    {stats.percentile}% of students scored lower than you!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Courses Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.coursesCompleted}/{stats.totalCourses}
                </p>
              </div>
              <div className="p-3 bg-sage-100 rounded-full">
                <BookOpen className="h-6 w-6 text-sage-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-sage-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{completionPercentage}% complete</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="success" size="sm">
                +5% from last month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.streak} days</p>
              </div>
              <div className="p-3 bg-wood-100 rounded-full">
                <Calendar className="h-6 w-6 text-wood-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="warning" size="sm">
                Keep it up!
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hours Studied</p>
                <p className="text-2xl font-bold text-gray-900">{stats.hoursStudied}h</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">This month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Progress Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-sage-600" />
              <h3 className="text-lg font-semibold">Monthly Progress</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#8FBC8F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Comparison */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-wood-600" />
              <h3 className="text-lg font-semibold">Performance Comparison</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={comparisonData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-sage-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Your Score (92%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-wood-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Average (75%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Activities</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'exam' ? 'bg-sage-100' : 'bg-wood-100'
                  }`}>
                    {activity.type === 'exam' ? (
                      <FileText className={`h-4 w-4 ${
                        activity.type === 'exam' ? 'text-sage-600' : 'text-wood-600'
                      }`} />
                    ) : (
                      <BookOpen className="h-4 w-4 text-wood-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.type === 'exam' ? (
                    <Badge variant="success" size="sm">
                      {activity.score}% Score
                    </Badge>
                  ) : (
                    <Badge variant="info" size="sm">
                      {activity.progress}% Complete
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Button variant="primary">
          <BookOpen className="h-4 w-4 mr-2" />
          Continue Learning
        </Button>
        <Button variant="outline">
          <Target className="h-4 w-4 mr-2" />
          Take Practice Test
        </Button>
        <Button variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Detailed Analytics
        </Button>
      </div>
    </div>
  );
};

export default StudentDashboardNew;