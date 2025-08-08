import { Container, Scrollbar, Toggle, Checkbox } from 'mc-ui-comatv';
import { categoryColors } from '../../server/data.jsx';

const CategoryTogglePanel = ({ allCategories, selectedCategories, onToggleChange }) => {
  return (
    <div className="w-full lg:w-1/4 xl:w-1/5 min-w-[280px] max-w-full lg:max-w-none">
      <Container>
        <p className="text-white mb-2 sm:mb-4 text-lg sm:text-xl">Categories</p>
        <Scrollbar height="60vh sm:70vh lg:80vh">
          <div className="p-2">
            {allCategories.map((category, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-2 py-1 sm:py-2 ${
                  category === 'Special' 
                    ? 'border-2 border-yellow-400 px-6 py-4 bg-yellow-400/10' 
                    : ''
                }`}
              >
                {category === 'Special' && (
                  <img 
                    src="techno/special.webp" 
                    alt="Special" 
                    className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" 
                  />
                )}
                <span className={`text-xs sm:text-sm flex-1 min-w-0 truncate ${
                  category === 'Special' ? 'text-yellow-300 minecraft-font' : `text-${categoryColors[category] || 'green'}-400`
                }`}>
                  {category}
                </span>
                <div className="ml-auto flex-shrink-0">
                  {category === 'Special' ? (
                    <Toggle
                      checked={selectedCategories.includes(category)}
                      onChange={(isChecked) => onToggleChange(category, isChecked)}
                    />
                  ) : (
                    <Checkbox
                      label=""
                      checked={selectedCategories.includes(category)}
                      onChange={(isChecked) => onToggleChange(category, isChecked)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Scrollbar>
      </Container>
    </div>
  );
};

export default CategoryTogglePanel; 