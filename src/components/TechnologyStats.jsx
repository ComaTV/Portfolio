import React, { useState } from 'react';
import { Container, LoadingBar,Button , Scrollbar } from 'mc-ui-comatv';
import { projectsData, categoryColors } from '../server/data.jsx';
import { CircularChart3DComponent, CircularChart3DSeriesCollectionDirective, CircularChart3DSeriesDirective, PieSeries3D, CircularChartDataLabel3D, CircularChartLegend3D, Inject } from '@syncfusion/ej2-react-charts';

const TechnologyStats = () => {
  const [activeTab, setActiveTab] = useState('technologies');
  
  const getTextColor = (variant) => {
    switch (variant) {
      case 'red': return 'text-red-400';
      case 'blue': return 'text-blue-400';
      case 'green': return 'text-green-400';
      case 'yellow': return 'text-yellow-400';
      case 'purple': return 'text-purple-400';
      case 'cyan': return 'text-cyan-400';
      case 'orange': return 'text-amber-400';
      case 'white': return 'text-gray-200';
      case 'gray': return 'text-gray-400';
      default: return 'text-gray-300';
    }
  };
  return (
    <Container className="w-full">
      <div className="flex space-x-2 mb-6">
        <Button
          label="Technologies"
          variant={activeTab === 'technologies' ? 'green' : 'default'}
          onClick={() => setActiveTab('technologies')}
        />
        <Button
          label="Platforms"
          variant={activeTab === 'platforms' ? 'green' : 'default'}
          onClick={() => setActiveTab('platforms')}
        />
      </div>
      <div className="flex flex-col md:flex-row items-start md:space-x-8 space-y-8 md:space-y-0 w-full">
        <div className="w-full md:flex-1 md:w-auto">
          <h4 className="text-md font-medium text-gray-300 mb-3">
            {activeTab === 'technologies' ? 'Technology Distribution' : 'Platform Distribution'}
          </h4>
          <div className="flex justify-center">
            {(() => {
              let  pieData;
              if (activeTab === 'technologies') {
                const allTechnologies = projectsData.flatMap(project => project.technologies);
                const techCount = {};
                allTechnologies.forEach(tech => {
                  const techName = tech.name;
                  techCount[techName] = (techCount[techName] || 0) + 1;
                });
                const totalProjects = projectsData.length;
                pieData = Object.entries(techCount)
                  .map(([techName, count]) => {
                    const techObj = allTechnologies.find(tech => tech.name === techName);
                    const percentage = Math.round((count / totalProjects) * 100);
                    return {
                      x: techName,
                      y: percentage,
                      fill: techObj ? techObj.color : '#6B7280'
                    };
                  })
                  .sort((a, b) => b.y - a.y);
              } else {
                const categoryCount = {};
                projectsData.forEach(project => {
                  categoryCount[project.category] = (categoryCount[project.category] || 0) + 1;
                });
                const totalProjects = projectsData.length;
                pieData = Object.entries(categoryCount)
                  .map(([category, count]) => {
                    const percentage = Math.round((count / totalProjects) * 100);
                    const color = categoryColors[category] || '#3B82F6';
                    // Map color name to Tailwind color hex if needed
                    const colorMap = {
                      green: '#22c55e',
                      blue: '#3b82f6',
                      purple: '#a78bfa',
                      amber: '#f59e42',
                      cyan: '#22d3ee',
                      yellow: '#fde047',
                      white: '#e5e7eb',
                      orange: '#f59e42',
                    };
                    return {
                      x: category,
                      y: percentage,
                      fill: colorMap[color] || color
                    };
                  })
                  .sort((a, b) => b.y - a.y);
              }
              return (
                <CircularChart3DComponent
                  id="pie-chart"
                  width="350"
                  height="300"
                  tilt={-65}
                  legendSettings={{ visible: false }}
                  background="transparent"
                >
                  <Inject services={[PieSeries3D, CircularChartDataLabel3D, CircularChartLegend3D]} />
                  <CircularChart3DSeriesCollectionDirective>
                    <CircularChart3DSeriesDirective
                      dataSource={pieData}
                      xName="x"
                      yName="y"
                      pointColorMapping="fill"
                      dataLabel={{
                        visible: false
                      }}
                    />
                  </CircularChart3DSeriesCollectionDirective>
                </CircularChart3DComponent>
              );
            })()}
          </div>
        </div>
        <div className="w-full md:w-80">
          <h4 className="text-md font-medium text-gray-300 mb-3">
            {activeTab === 'technologies' ? 'Technology Usage' : 'Platform Usage'}
          </h4>
          <Scrollbar 
            height="300px" 
            width="100%" 
            variant="vertical" 
            className="space-y-4"
            style={{ gap: 0, padding: 0, margin: 0 }}
          >
            {(() => {
              if (activeTab === 'technologies') {
                const allTechnologies = projectsData.flatMap(project => project.technologies);
                const techCount = {};
                allTechnologies.forEach(tech => {
                  const techName = tech.name;
                  techCount[techName] = (techCount[techName] || 0) + 1;
                });
                const totalProjects = projectsData.length;
                const techPercentages = Object.entries(techCount)
                  .map(([techName, count]) => {
                    const techObj = allTechnologies.find(tech => tech.name === techName);
                    return {
                      name: techName,
                      percentage: Math.round((count / totalProjects) * 100),
                      variant: techObj ? techObj.color : 'gray',
                      icon: `techno/${techName.toLowerCase().replace('.', '').replace(' ', '')}.webp`
                    };
                  })
                  .sort((a, b) => b.percentage - a.percentage);
                return techPercentages.map(({ name, percentage, variant, icon }) => (
                  <div key={name} className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={icon}
                          alt={name}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <span className={`text-sm font-medium ${getTextColor(variant)}`}>{name}</span>
                      </div>
                      <span className={`text-sm font-medium ${getTextColor(variant)}`}>{percentage}%</span>
                    </div>
                    <LoadingBar progress={percentage} variant={variant} />
                  </div>
                ));
              } else {
                const categoryCount = {};
                projectsData.forEach(project => {
                  categoryCount[project.category] = (categoryCount[project.category] || 0) + 1;
                });
                const totalProjects = projectsData.length;
                const categoryPercentages = Object.entries(categoryCount)
                  .map(([category, count]) => {
                    const color = categoryColors[category] || 'green';
                    return {
                      name: category,
                      percentage: Math.round((count / totalProjects) * 100),
                      variant: color
                    };
                  })
                  .sort((a, b) => b.percentage - a.percentage);
                return categoryPercentages.map(({ name, percentage, variant }) => (
                  <div key={name} className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${getTextColor(variant)}`}>{name}</span>
                      <span className={`text-sm font-medium ${getTextColor(variant)}`}>{percentage}%</span>
                    </div>
                    <LoadingBar progress={percentage} variant={variant} />
                  </div>
                ));
              }
            })()}
          </Scrollbar>
        </div>
      </div>
    </Container>
  );
};

export default TechnologyStats; 