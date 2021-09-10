export const defaultRenderDate = ({ date, formatterDate }) => {
	return <span class={date.date === formatterDate ? "is-selected" : ""}>{date.day}</span>;
};
export const defaultRenderMonth = ({ month, year, lang, monthNames }) => {
	return (
		<div class="vc-calendar__month">
			<div>
				{monthNames[month][lang]} &nbsp;&nbsp;&nbsp;&nbsp;
				{year}
			</div>
		</div>
	);
};
export const defaultRenderWeek = ({ weekNames, lang }) => {
	return (
		<div class="vc-calendar__week">
			{
				weekNames.map((item: any, index: number) => {
					return <span key={index}>{item[lang]}</span>;
				})
			}
		</div>
	);
};