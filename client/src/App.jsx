import Billing from "./modules/billing/Billing";
import Pharmacy from "./modules/pharmacy/Pharmacy";

function App() {
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
        <Billing />
        <Pharmacy/>
      </div>
    </div>
  );
}

export default App;