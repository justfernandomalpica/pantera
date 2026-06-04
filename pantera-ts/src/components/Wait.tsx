import DeleteRoom from "./DeleteRoom";

interface WaitingProps {
  code: string | null;
  handleDeleteRoom: () => void;
}

export default function Wait({ code, handleDeleteRoom }: WaitingProps) {
  return (
    <section className="screen-wait">
      <h2>Esperando oponente</h2>
      <div className="spinner"></div>

      <p>
        Código de sala: <strong>{code ?? "Generando..."}</strong>
      </p>
      <DeleteRoom handleDeleteRoom={handleDeleteRoom} />
    </section>
  );
}
