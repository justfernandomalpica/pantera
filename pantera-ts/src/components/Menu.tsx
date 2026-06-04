import { useState } from "react";

interface MenuProps {
  handlePlayLocal: () => void;
  handleCreateRoom: () => void;
  handleJoinRoom: (code: string) => void;
}

export default function Menu({
  handlePlayLocal,
  handleCreateRoom,
  handleJoinRoom,
}: MenuProps) {
  const [code, setCode] = useState("");

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
        <button type="button" onClick={handleCreateRoom}>
          Crear sala
        </button>
      </div>
      <input
        id="roomCode"
        type="text"
        placeholder="Código de sala"
        value={code}
        onChange={(e) => handleInputChange(e.target.value)}
      />
      <button type="button" onClick={() => handleJoinRoom(code)}>
        Unirse
      </button>
    </section>
  );
}
