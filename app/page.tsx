import Chat from '@/components/chat';
import ProjectControls from '@/components/project-controls';
import StatusBar from '@/components/status-bar';

export default function Home() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-4">Assistente de Programação IA</h1>
          <Chat />
        </div>
        <div className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm p-4 border">
            <h2 className="text-xl font-semibold mb-3">Controles do Projeto</h2>
            <ProjectControls />
          </div>
          <div className="bg-card rounded-lg shadow-sm p-4 border">
            <h2 className="text-xl font-semibold mb-3">Status do Sistema</h2>
            <StatusBar />
          </div>
        </div>
      </div>
    </div>
  );
}