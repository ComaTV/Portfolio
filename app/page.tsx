import Taskbar from '../components/Taskbar'
export default function Home() {
  return (
    <div className="absolute bg-[url(/background.jpg)] w-screen h-screen bg-center bg-no-repeat bg-cover">
      <Taskbar/>
    </div>
  );
}