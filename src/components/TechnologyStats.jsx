import React from 'react';
import { Container, LoadingBar } from 'mc-ui-comatv';
import { CircularChart3DComponent, CircularChart3DSeriesCollectionDirective, CircularChart3DSeriesDirective, PieSeries3D, CircularChartDataLabel3D, CircularChartLegend3D, Inject } from '@syncfusion/ej2-react-charts';

const TechnologyStats = ({ projectsData }) => {
  return (
    <Container className="max-w-md">
      <h3 className="text-lg text-white mb-4">Statistici Tehnologii</h3>
      
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-300 mb-3">Distribuția Tehnologiilor</h4>
        <div className="flex justify-center">
          {(() => {
            const allTechnologies = projectsData.flatMap(project => project.technologies);
            const techCount = {};
            allTechnologies.forEach(tech => {
              techCount[tech] = (techCount[tech] || 0) + 1;
            });
            
            const totalProjects = projectsData.length;
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
            const pieData = Object.entries(techCount)
              .map(([tech, count], index) => ({
                x: tech,
                y: Math.round((count / totalProjects) * 100),
                color: colors[index % colors.length]
              }))
              .sort((a, b) => b.y - a.y)
              .slice(0, 6); // Top 6 for pie chart
            
            return (
              <CircularChart3DComponent
                id="pie-chart"
                width="250"
                height="250"
                title="Distribuția Tehnologiilor"
                tilt={-45}
                legendSettings={{ visible: false }}
                background="transparent"
              >
                <Inject services={[PieSeries3D, CircularChartDataLabel3D, CircularChartLegend3D]} />
                <CircularChart3DSeriesCollectionDirective>
                  <CircularChart3DSeriesDirective
                    dataSource={pieData}
                    xName="x"
                    yName="y"
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
      
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-300 mb-3">Utilizare Tehnologii</h4>
        {(() => {
          const allTechnologies = projectsData.flatMap(project => project.technologies);
          const techCount = {};
          allTechnologies.forEach(tech => {
            techCount[tech] = (techCount[tech] || 0) + 1;
          });
          
          const totalProjects = projectsData.length;
          const techPercentages = Object.entries(techCount)
            .map(([tech, count]) => ({
              tech,
              percentage: Math.round((count / totalProjects) * 100)
            }))
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 8);
          
          return techPercentages.map(({ tech, percentage }) => (
            <div key={tech} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img 
                    src={`techno/${tech.toLowerCase().replace('.', '').replace(' ', '')}.webp`}
                    alt={tech}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <span className="text-gray-300 text-sm">{tech}</span>
                </div>
                <span className="text-blue-400 text-sm font-medium">{percentage}%</span>
              </div>
              <LoadingBar progress={percentage} variant="blue" />
            </div>
          ));
        })()}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-600">
        <h4 className="text-md font-medium text-gray-300 mb-3">Platforme Dezvoltate</h4>
        {(() => {
          const categoryCount = {};
          projectsData.forEach(project => {
            categoryCount[project.category] = (categoryCount[project.category] || 0) + 1;
          });
          
          const totalProjects = projectsData.length;
          const categoryPercentages = Object.entries(categoryCount)
            .map(([category, count]) => ({
              category,
              percentage: Math.round((count / totalProjects) * 100)
            }))
            .sort((a, b) => b.percentage - a.percentage);
          
          return categoryPercentages.map(({ category, percentage }) => (
            <div key={category} className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">{category}</span>
                <span className="text-green-400 text-sm font-medium">{percentage}%</span>
              </div>
              <LoadingBar progress={percentage} variant="green" />
            </div>
          ));
        })()}
      </div>
    </Container>
  );
};

export default TechnologyStats; 