
export default function Recipes() {
  return (
    <>
      <p>RECIPES</p>
      {
        Array.from({ length: 150 }, (_, i) => <span key={i}>{i}</span>)
      }
    </>
  );
}
