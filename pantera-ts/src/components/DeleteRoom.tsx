interface DeleteRoomProps {
  handleDeleteRoom: () => void;
}

export default function DeleteRoom({ handleDeleteRoom }: DeleteRoomProps) {
  return (
    <button type="button" onClick={handleDeleteRoom}>
      Abandonar
    </button>
  );
}
