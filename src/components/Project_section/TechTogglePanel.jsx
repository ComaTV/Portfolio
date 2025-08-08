import { Container, Scrollbar, Checkbox } from 'mc-ui-comatv';

const TechTogglePanel = ({ allTechnologies, selectedTechs, onToggleChange }) => {
  return (
    <div className="w-full lg:w-1/4 xl:w-1/5 min-w-[280px] max-w-full lg:max-w-none h-full">
      <Container className="h-full">
        <p className="text-white mb-2 sm:mb-4 text-lg sm:text-xl ">Technologies</p>
        <Scrollbar height="calc(100% - 60px)">
          <div className="pr-2">
            {allTechnologies.map((item, i) => (
              <div key={i} className="flex items-center gap-2 py-1 sm:py-2">
                <img src={item.icon} alt={item.label} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span className="text-xs sm:text-sm flex-1 min-w-0 truncate">{item.label}</span>
                <div className="ml-auto flex-shrink-0">
                  <Checkbox
                    label=""
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
