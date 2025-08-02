import { Container, Scrollbar, Toggle } from 'mc-ui-comatv';

const CategoryTogglePanel = ({ allCategories, selectedCategories, onToggleChange }) => {
  return (
    <div className="w-full lg:w-1/4 xl:w-1/5 min-w-[280px] max-w-full lg:max-w-none">
      <Container>
        <p className="text-white mb-2 sm:mb-4 text-lg sm:text-xl">Categories</p>
        <Scrollbar height="60vh sm:70vh lg:80vh">
          <div className="pr-2">
            {allCategories.map((category, i) => (
              <div key={i} className="flex items-center gap-2 py-1 sm:py-2">
                <span className="text-xs sm:text-sm flex-1 min-w-0 truncate">{category}</span>
                <div className="ml-auto flex-shrink-0">
                  <Toggle
                    checked={selectedCategories.includes(category)}
                    onChange={(isChecked) => onToggleChange(category, isChecked)}
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

export default CategoryTogglePanel; 