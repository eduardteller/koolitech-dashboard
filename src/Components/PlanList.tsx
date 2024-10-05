import {
	BadgeCheck,
	BadgeMinus,
	BadgePlus,
	SquareChartGantt,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
	active: string;
	setActive: (active: string) => void;
}

const testData = {
	plans: [
		{
			name: 'Item 1',
		},
		{
			name: 'Item 2',
		},
	],
	enabled: 'Item 2',
	active: 'Item 1',
};

interface Plans {
	plans: Plan[];
	enabled: string;
	active: string;
}

interface Plan {
	name: string;
}

const PlanList = ({ active, setActive }: Props) => {
	const [plans, setPlans] = useState<Plans>({ ...testData });
	const [loading, setLoading] = useState(true);

	const deletePlan = () => {
		setPlans({
			...plans,
			plans: plans.plans.filter((plan) => plan.name !== active),
		});
	};

	const newPlan = () => {
		setPlans({
			...plans,
			plans: [...plans.plans, { name: 'New Plan' + plans.plans.length }],
		});
	};

	useEffect(() => {
		const url = import.meta.env.VITE_BASE_URL;
		setLoading(true);
		fetch(url + '/api/preset-list', {
			method: 'GET',
		})
			.then((response) => {
				response.json().then((data) => {
					// console.log(data);
					setPlans({ ...data });
				});
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	if (loading) {
		return (
			<div className="menu flex h-full w-60 items-center justify-center bg-base-200 p-4">
				<span className="loading loading-spinner loading-md"></span>
			</div>
		);
	}

	return (
		<ul className="menu h-full w-60 bg-base-200 p-4">
			<div className="flex h-full w-full flex-col">
				<h1 className="my-4 flex items-center justify-center gap-2 text-center text-xl font-bold uppercase">
					<p>Plaanid</p> <SquareChartGantt />
				</h1>
				<div className="flex w-full flex-1 flex-col justify-between">
					<ul>
						{plans.plans.map((plan, index) => {
							return (
								<li key={index}>
									<a
										onClick={() => setActive(plan.name)}
										className={`${
											plan.name === active ? 'active' : null
										} flex w-full items-center justify-between`}
									>
										<p>{plan.name}</p>
										{plan.name === plans.enabled ? (
											<div className="badge badge-secondary ml-10">
												Aktiivne
											</div>
										) : null}
									</a>
								</li>
							);
						})}
					</ul>
					<div className="flex flex-col items-center justify-start gap-2 pb-20">
						<button
							className="btn btn-secondary w-36"
							onClick={newPlan}
							// onClick={my_modal_1.showModal()}
						>
							Uus <BadgePlus />
						</button>
						<button onClick={deletePlan} className="btn btn-secondary w-36">
							Kustuta <BadgeMinus />
						</button>
						<button className="btn btn-secondary w-36">
							Kasuta <BadgeCheck />
						</button>
					</div>
				</div>
			</div>
		</ul>
	);
};

export default PlanList;
