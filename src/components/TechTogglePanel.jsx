import { Container, Scrollbar, Toggle } from 'mc-ui-comatv';

const TechTogglePanel = ({ allTechnologies, selectedTechs, onToggleChange }) => {
  return (
    <div className="max-w-[20%]">
      <Container>
        <h2 className="text-white mb-4">Technologies</h2>
        <Scrollbar height="80vh">
          <div className="pr-2">
            {allTechnologies.map((item, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <img src={item.icon} alt={item.label} className="w-6 h-6" />
                <span className="text-sm text-white">{item.label}</span>
                <div className="ml-auto">
                  <Toggle
                    checked={selectedTechs.includes(item.label)}
                    onChange={(isChecked) => onToggleChange(item.label, isChecked)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Scrollbar>
      </Container>
    </div>
  );
};

export default TechTogglePanel;
