import React from 'react';
import { 
  Button, 
  Container, 
  Scrollbar
} from 'mc-ui-comatv';

function App() {
  return (
    <div className='bg-blue-500 h-screen w-screen'>
      <div className='h-1'/>
      <Container
      >
        <p>Welcome to Minecraft UI!</p>
        <Button 
          label="Click me!" 
          onClick={() => alert('Hello!')}
        />
        <Scrollbar height="300px" grid={true} gridCols={3}>
        </Scrollbar>
      </Container>
    </div>
  );
}

export default App;
