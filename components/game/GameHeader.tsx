type GameHeaderProps = {
  gName: string
  // teamName: string
}

export default function GameHeader({
  gName,
  // teamName
}: GameHeaderProps) {
  return (
    <div className="flex justify-between items-center p-4 border-b">

      <div>{gName}</div> 


    </div>
  );
}