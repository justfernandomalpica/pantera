import { useState, type SubmitEvent } from "react";

interface MenuProps {
  handlePlayLocal: () => void;
  handlePlayAgent: () => void;
  handleCreateRoom: () => void;
  handleJoinRoom: (code: string) => void;
}

export default function Menu({
  handlePlayLocal,
  handlePlayAgent,
  handleCreateRoom,
  handleJoinRoom,
}: MenuProps) {
  const [code, setCode] = useState("");

  function handleSubmit(e: SubmitEvent<HTMLFormElement>, code: string) {
    e.preventDefault();
    handleJoinRoom(code);
  }

  function handleInputChange(code: string) {
    if (code.length > 4) return;
    setCode(code.toUpperCase());
  }

  return (
    <section className="screen-menu">
      <div className="buttons">
        <button type="button" onClick={handlePlayLocal}>
          Jugar localmente
        </button>
        <button type="button" onClick={handlePlayAgent}>
          Jugar contra IA
        </button>
        <button type="button" onClick={handleCreateRoom}>
          Crear sala
        </button>
      </div>
      <form className="code-form" onSubmit={(e) => handleSubmit(e, code)}>
        <input
          id="roomCode"
          type="text"
          placeholder="Código de sala"
          value={code}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        <input id="submitGameCode" type="submit" value="Unirse" />
      </form>
    </section>
  );
}
