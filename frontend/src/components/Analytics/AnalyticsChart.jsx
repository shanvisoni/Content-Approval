import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Paper,
  ButtonGroup,
  Button,
  Chip,
  Avatar,
  Skeleton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  DonutChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  DonutLarge,
  BarChart as BarChartIcon,
  ShowChart,
  PieChart as PieChartIcon,
  Refresh,
  Download,
  DateRange,
  FilterList,
  Insights,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { contentAPI } from '../../services/api';

const AnalyticsChart = ({ 
  showControls = true, 
  defaultChartType = 'bar',
  timeRange = '7d',
  height = 400 
}) => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState(defaultChartType);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  };

  // Color schemes
  const colorPalette = {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    light: '#f8fafc',
  };

  const statusColors = {
    pending: colorPalette.warning,
    approved: colorPalette.success,
    rejected: colorPalette.error,
    total: colorPalette.primary,
  };

  const gradientDefs = (
    <defs>
      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={statusColors.pending} stopOpacity={0.8}/>
        <stop offset="95%" stopColor={statusColors.pending} stopOpacity={0.2}/>
      </linearGradient>
      <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={statusColors.approved} stopOpacity={0.8}/>
        <stop offset="95%" stopColor={statusColors.approved} stopOpacity={0.2}/>
      </linearGradient>
      <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={statusColors.rejected} stopOpacity={0.8}/>
        <stop offset="95%" stopColor={statusColors.rejected} stopOpacity={0.2}/>
      </linearGradient>
    </defs>
  );

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch basic stats
      const statsResponse = await contentAPI.getStats();
      setStats(statsResponse.data);

      // Generate mock time series data based on stats
      const timeSeriesData = generateTimeSeriesData(statsResponse.data);
      setTimeSeriesData(timeSeriesData);

      // Generate category breakdown
      const categoryData = generateCategoryData(statsResponse.data);
      setCategoryData(categoryData);

      // Generate trend data
      const trendData = generateTrendData();
      setTrendData(trendData);

    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSeriesData = (stats) => {
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate realistic data distribution
      const dayFactor = Math.random() * 0.3 + 0.7; // 0.7 to 1.0
      const weekendFactor = date.getDay() === 0 || date.getDay() === 6 ? 0.6 : 1.0;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pending: Math.round(stats.pending * dayFactor * weekendFactor * Math.random() * 0.3),
        approved: Math.round(stats.approved * dayFactor * weekendFactor * Math.random() * 0.2),
        rejected: Math.round(stats.rejected * dayFactor * weekendFactor * Math.random() * 0.1),
        total: 0,
      });
    }
    
    // Calculate totals
    data.forEach(item => {
      item.total = item.pending + item.approved + item.rejected;
    });
    
    return data;
  };

  const generateCategoryData = (stats) => {
    return [
      { 
        name: 'Pending', 
        value: stats.pending, 
        color: statusColors.pending,
        percentage: ((stats.pending / stats.total) * 100).toFixed(1)
      },
      { 
        name: 'Approved', 
        value: stats.approved, 
        color: statusColors.approved,
        percentage: ((stats.approved / stats.total) * 100).toFixed(1)
      },
      { 
        name: 'Rejected', 
        value: stats.rejected, 
        color: statusColors.rejected,
        percentage: ((stats.rejected / stats.total) * 100).toFixed(1)
      },
    ].filter(item => item.value > 0);
  };

  const generateTrendData = () => {
    return [
      { metric: 'Approval Rate', value: 75, trend: 'up', change: '+5.2%' },
      { metric: 'Response Time', value: 2.4, unit: 'days', trend: 'down', change: '-12%' },
      { metric: 'User Activity', value: 89, trend: 'up', change: '+15.8%' },
      { metric: 'Quality Score', value: 4.2, unit: '/5', trend: 'up', change: '+0.3' },
    ];
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper 
          elevation={8} 
          className="p-4 border-0"
          sx={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" className="gradient-text font-semibold mb-2">
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
              <Box 
                width={12} 
                height={12} 
                borderRadius="50%" 
                bgcolor={entry.color}
              />
              <Typography variant="body2" color="textSecondary">
                {entry.name}: <strong>{entry.value}</strong>
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (loading) {
      return (
        <Box height={height} display="flex" alignItems="center" justifyContent="center">
          <Skeleton variant="rectangular" width="100%" height="80%" />
        </Box>
      );
    }

    const commonProps = {
      width: '100%',
      height: height,
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              {gradientDefs}
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                fontSize={12}
                tick={{ fill: '#666' }}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tick={{ fill: '#666' }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="approved" 
                name="Approved"
                fill={statusColors.approved}
                radius={[2, 2, 0, 0]}
                animationDuration={1000}
              />
              <Bar 
                dataKey="pending" 
                name="Pending"
                fill={statusColors.pending}
                radius={[2, 2, 0, 0]}
                animationDuration={1200}
              />
              <Bar 
                dataKey="rejected" 
                name="Rejected"
                fill={statusColors.rejected}
                radius={[2, 2, 0, 0]}
                animationDuration={1400}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              {gradientDefs}
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                fontSize={12}
                tick={{ fill: '#666' }}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tick={{ fill: '#666' }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="approved" 
                name="Approved"
                stroke={statusColors.approved}
                strokeWidth={3}
                dot={{ fill: statusColors.approved, strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: statusColors.approved, strokeWidth: 2 }}
                animationDuration={1000}
              />
              <Line 
                type="monotone" 
                dataKey="pending" 
                name="Pending"
                stroke={statusColors.pending}
                strokeWidth={3}
                dot={{ fill: statusColors.pending, strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: statusColors.pending, strokeWidth: 2 }}
                animationDuration={1200}
              />
              <Line 
                type="monotone" 
                dataKey="rejected" 
                name="Rejected"
                stroke={statusColors.rejected}
                strokeWidth={3}
                dot={{ fill: statusColors.rejected, strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: statusColors.rejected, strokeWidth: 2 }}
                animationDuration={1400}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              {gradientDefs}
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                fontSize={12}
                tick={{ fill: '#666' }}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tick={{ fill: '#666' }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="approved" 
                name="Approved"
                stackId="1"
                stroke={statusColors.approved}
                fill="url(#colorApproved)"
                animationDuration={1000}
              />
              <Area 
                type="monotone" 
                dataKey="pending" 
                name="Pending"
                stackId="1"
                stroke={statusColors.pending}
                fill="url(#colorPending)"
                animationDuration={1200}
              />
              <Area 
                type="monotone" 
                dataKey="rejected" 
                name="Rejected"
                stackId="1"
                stroke={statusColors.rejected}
                fill="url(#colorRejected)"
                animationDuration={1400}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                animationDuration={1000}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value, name) => [value, name]}
                labelFormatter={() => 'Content Status'}
                content={<CustomTooltip />}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const TrendCard = ({ metric, value, unit = '', trend, change }) => (
    <motion.div variants={cardVariants}>
      <Paper 
        elevation={2} 
        className="p-4 hover-lift"
        sx={{ 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="between">
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {metric}
            </Typography>
            <Typography variant="h5" fontWeight="bold" className="gradient-text">
              {value}{unit}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {trend === 'up' ? (
              <TrendingUp color="success" />
            ) : (
              <TrendingDown color="error" />
            )}
            <Typography 
              variant="body2" 
              color={trend === 'up' ? 'success.main' : 'error.main'}
              fontWeight="medium"
            >
              {change}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={fetchAnalyticsData}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Grid container spacing={3}>
        {/* Main Chart */}
        <Grid item xs={12} lg={8}>
          <motion.div variants={cardVariants}>
            <Card className="hover-lift" sx={{ height: '100%' }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Assessment />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" className="gradient-text font-semibold">
                    Content Analytics Dashboard
                  </Typography>
                }
                subheader={`Showing data for the last ${selectedTimeRange === '7d' ? '7 days' : selectedTimeRange === '30d' ? '30 days' : '3 months'}`}
                action={
                  showControls && (
                    <Box display="flex" gap={1} alignItems="center">
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Period</InputLabel>
                        <Select
                          value={selectedTimeRange}
                          label="Period"
                          onChange={(e) => setSelectedTimeRange(e.target.value)}
                        >
                          <MenuItem value="7d">7 Days</MenuItem>
                          <MenuItem value="30d">30 Days</MenuItem>
                          <MenuItem value="90d">3 Months</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <ButtonGroup variant="outlined" size="small">
                        <Button
                          variant={chartType === 'bar' ? 'contained' : 'outlined'}
                          onClick={() => setChartType('bar')}
                        >
                          <BarChartIcon fontSize="small" />
                        </Button>
                        <Button
                          variant={chartType === 'line' ? 'contained' : 'outlined'}
                          onClick={() => setChartType('line')}
                        >
                          <ShowChart fontSize="small" />
                        </Button>
                        <Button
                          variant={chartType === 'area' ? 'contained' : 'outlined'}
                          onClick={() => setChartType('area')}
                        >
                          <Assessment fontSize="small" />
                        </Button>
                        <Button
                          variant={chartType === 'pie' ? 'contained' : 'outlined'}
                          onClick={() => setChartType('pie')}
                        >
                          <PieChartIcon fontSize="small" />
                        </Button>
                      </ButtonGroup>
                      
                      <Tooltip title="Refresh Data">
                        <IconButton onClick={fetchAnalyticsData} color="primary">
                          <Refresh />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )
                }
              />
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={chartType}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderChart()}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Sidebar with Stats */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            {/* Quick Stats */}
            <Grid item xs={12}>
              <motion.div variants={cardVariants}>
                <Card className="hover-lift">
                  <CardHeader
                    title={
                      <Typography variant="h6" className="gradient-text">
                        <Insights className="mr-2" />
                        Quick Stats
                      </Typography>
                    }
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      {Object.entries(stats).map(([key, value]) => (
                        <Grid item xs={6} key={key}>
                          <Box textAlign="center">
                            <Avatar
                              sx={{ 
                                bgcolor: `${statusColors[key] || statusColors.total}20`,
                                color: statusColors[key] || statusColors.total,
                                mx: 'auto',
                                mb: 1,
                                width: 48,
                                height: 48,
                              }}
                            >
                              <Typography variant="h6" fontWeight="bold">
                                {value}
                              </Typography>
                            </Avatar>
                            <Typography variant="body2" color="textSecondary">
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Trend Indicators */}
            <Grid item xs={12}>
              <motion.div variants={cardVariants}>
                <Card className="hover-lift">
                  <CardHeader
                    title={
                      <Typography variant="h6" className="gradient-text">
                        <TrendingUp className="mr-2" />
                        Performance Trends
                      </Typography>
                    }
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      {trendData.map((trend, index) => (
                        <Grid item xs={12} key={index}>
                          <TrendCard {...trend} />
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default AnalyticsChart;