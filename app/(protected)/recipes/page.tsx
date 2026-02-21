
export default function RecipesPage() {
  return (
    <>
      <p>RECIPES</p>
      {
        Array.from({ length: 150 }, (_, i) => <span key={i}>{i}</span>)
      }
    </>
  );
}
