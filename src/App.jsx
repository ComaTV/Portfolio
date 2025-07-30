import React from 'react';
import PanoramaBackground from './components/PanoramaBackground';

import { 
  Container,
  Button,
  Scrollbar,
  MessageBox,
  ImageCard
} from 'mc-ui-comatv';

function App() {
  return (
    <div className='relative h-screen w-screen overflow-hidden'>
      <PanoramaBackground />
      <div className="flex gap-2 flex-wrap">
          <Button label="Green Button"/>
          <Scrollbar height="400px" width="1000px" variant="vertical" grid={true} gridCols={3}>
            {Array.from({ length: 12 }, (_, i) => (
              <ImageCard
                imageSrc={"panorama/panorama_0.png"}
                label="Title"
                description="description"
                iconImages={[
                  "techno/mongo.webp",
                  "techno/js.webp",
                  "techno/ts.webp",
                  "techno/css.webp"
                ]}
                onClick={() => alert("You clicked on the React card!")}
              />
            ))}
          </Scrollbar>
      </div>
    </div>
  );
}

export default App;
