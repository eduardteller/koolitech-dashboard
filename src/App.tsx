import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './Components/Protected';
import Dashboard from './Dashboard';
import Login from './Login';

const App = () => {
	return (
		<div>
			<Routes>
				<Route path="/" element={<Navigate to="/dashboard" />} />
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					}
				/>
				<Route path="/login" element={<Login />} />
				{/* <Route path="/test" element={<Test />} /> */}
			</Routes>
		</div>
	);
};

export default App;
