import { isLoggedIn } from "@/lib/actions/auth";
const Dashboard = async () => {
  const test = await isLoggedIn();
  console.log("isLoggedIn", test);
  return (
    <main>
      <div>Dashboard</div>
      <p>isLoggedIn: {`${test}`}</p>
    </main>
  );
};

export default Dashboard;
