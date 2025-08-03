import React, { useEffect, useRef } from 'react';
import { Container, LoadingBar } from 'mc-ui-comatv';
import { projectsData } from '../server/data.jsx';
import * as skinview3d from 'skinview3d';
import { CircularChart3DComponent, CircularChart3DSeriesCollectionDirective, CircularChart3DSeriesDirective, PieSeries3D, CircularChartDataLabel3D, CircularChartLegend3D, Inject } from '@syncfusion/ej2-react-charts';

const ProfileSection = () => {
  const skinViewerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && !skinViewerRef.current) {
      try {
        skinViewerRef.current = new skinview3d.SkinViewer({
          canvas: canvasRef.current,
          width: 300,
          height: 400,
          skin: "https://mc-heads.net/skin/ComaTV"
        });

        skinViewerRef.current.animation = new skinview3d.IdleAnimation();
        skinViewerRef.current.animation.speed = 2;
        skinViewerRef.current.zoom = 0.8;
        skinViewerRef.current.fov = 60;
      } catch (error) {
        console.error('Error initializing skin viewer:', error);
      }
    }

    return () => {
      skinViewerRef.current = null;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-start justify-start">
        <div>
         <Container>
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-black p-0.5">
                <img src="logo192.png" alt="p" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500  border-2 border-green-300"></div>
            </div>
              <div className="flex-1">
                <div className="mb-4">
                  <h1 className="text-2xl text-white mb-1">ComaTV4776</h1>
                  <p className="text-sm text-gray-400">Online</p>
                </div>
              </div>
          </div>
              <div className="mt-6 pt-4 border-t border-gray-600">
               <h3 className="text-lg text-white mb-3">Technologies</h3>
               <div className="flex flex-wrap gap-3">
                 {(() => {
                   const allTechnologies = projectsData.flatMap(project => project.technologies);
                   const uniqueTechnologies = [...new Set(allTechnologies)];
                   
                   return uniqueTechnologies.map((tech) => {
                     const iconSrc = `techno/${tech.toLowerCase().replace('.', '').replace(' ', '')}.webp`;
                     return (
                        <img 
                          key={tech}
                          src={iconSrc} 
                          alt={tech} 
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                     );
                   });
                 })()}
               </div>
           </div>
         </Container>
          <Container variant="transparent">
            <div className="flex justify-center">
              <canvas ref={canvasRef}/>
            </div>
          </Container>
        </div>

        <Container className="max-w-md">
          <div className="bg-gray-800/90 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-4">Statistici Tehnologii</h3>
            
            {/* 3D Pie Chart */}
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
          </div>
        </Container>
    </div>
  );
};

export default ProfileSection; 