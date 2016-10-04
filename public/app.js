
const EventsDashboard = React.createClass({
	getInitialState: function () {
		return {
			data: [],
			allPeople: [],
		};

	},
	componentDidMount: function() {
		// console.log(this.state.data);
		this.loadEventsFromServer();
		this.loadPeopleFromServer();
		setInterval(this.loadEventsFromServer, 5000);
		setInterval(this.loadPeopleFromServer, 5000);
	},
	loadEventsFromServer: function () {
		client.getEvents({
			success: (data) => {
				this.setState({data: data});
				// console.log(this.state.data);
			},
		});
	},
	loadPeopleFromServer: function () {
		client.getPeople({
			success: (data) => {
				this.setState({allPeople: data});
				// console.log(this.state.allPeople);
			},
		});
	},
	handleCreateFormSubmit: function (event) {
		this.createEvent(event);
	},
	handleFormSubmit: function (attrs) {
		this.updateEvent(attrs)
	},
	handleEditFormSubmit: function (attrs) {
		this.updateEvent(attrs);
	},
	createEvent: function (event) {

	    const e = {
	      title: event.title || 'New Event',
	      date: event.date || '2016-07-06T19:00:00+10:00',
	      id: uuid.v4(), // eslint-disable-line no-undef
	    };

		// const e = helpers.newEvent(event);
		// console.log(e);
		this.setState({
			data: this.state.data.concat(e),
		});

		client.createEvent({
			data: e,
		});
	},
	updateEvent: function (attrs) {
		this.setState({
			data: this.state.data.map((event) => {
				if (event.id === attrs.id) {
					return Object.assign({}, event, {
						title: attrs.title,
						date: attrs.date
					});
				} else {
					return event;
				}
			}),
		});

		client.updateEvent({
			data: attrs,
		});
	},
	handleTrashClick: function (eventId) {
		this.deleteEvent(eventId);
	},
	deleteEvent: function(eventId) {
		this.setState({
			data: this.state.data.filter((e => e.id !== eventId)),
		});
		client.deleteEvent({
			data: { id:eventId },
		});
	},
	handleMinusClick: function (eventId, attendendeeId) {
		this.deleteAttendeeFromEvent(eventId, attendendeeId);
	},
	deleteAttendeeFromEvent: function (eventId, attendendeeId) {
		// console.log(this.state.data);
		// console.log(attendendeeId);
		var events = this.state.data;
		for(var i=0;i<events.length;i++){
			if(events[i].id == eventId) {
				for(var j=0;j<events[i].attendence.length;j++){
					if(events[i].attendence[j].personId===attendendeeId) {
						events[i].attendence.splice(j, 1);
					}
				}
			}
		}
		client.deleteAttendee({
			data: { 
				id:eventId, 
				personId:attendendeeId
			},
		});
		this.forceUpdate();
	},
	handleAddAttendee: function (eventId, personId) {
		this.addAttendeeToEvent(eventId, personId);
	},
	handleAddFamily: function(eventId, familyGroup) {
		this.addFamilyToEvent(eventId, familyGroup);
	},
	addFamilyToEvent: function(eventId, familyGroup) {
		// var familyMembers = [];
		const people = this.state.allPeople;
		for(var i=0;i<people.length;i++){
			if(people[i].familyGroup === familyGroup){
				this.addAttendeeToEvent(eventId, people[i].id);
			}
		}
	},
	handleCreatePerson: function(name, familyGroup, eventId){
		this.createPerson(name, familyGroup, eventId);
	},
	createPerson: function (name, familyGroup, eventId) {
		const person = {
	      name: name || 'John Doe',
	      familyGroup: familyGroup || '',
	      id: uuid.v4(), // eslint-disable-line no-undef
	    };

		// console.log(person);
		// console.log(this.state.allPeople);
		this.setState({
			allPeople: this.state.allPeople.push(person),
		});
		// console.log(this.state.allPeople);

		client.createPerson({
			data: person,
		});
		this.forceUpdate();
		if(eventId!=undefined){
			this.addAttendeeToEvent(eventId,person.id);
		}
	},
	addAttendeeToEvent: function (eventId, personId) {
		var events = this.state.data;
		const people = this.state.allPeople;
		var attendendee = {};

		// Find original person and create an attendee from them
		for(var i=0;i<people.length;i++){
			if(people[i].id === personId){
				// person = people[i];
				attendendee = {
					id: uuid.v4(),
					name: people[i].name,
					personId: people[i].id
				}
				// console.log(person);
			}
		}		
		for(var i=0;i<events.length;i++){
			if(events[i].id === eventId) {
				if(events[i].attendence === undefined) {
					var attendence = [];
					attendence.push(attendendee);
					events[i].attendence=attendence;
				} else {
					var match = false;
					// console.log(events[i].attendence.length);
					for(var j=0; j < events[i].attendence.length;j++){
						// console.log(events[i].attendence[j].personId);
						// console.log(attendendee.personId);
						if(events[i].attendence[j].personId===attendendee.personId){
							match = true;
						}
					}
					if(match === false) {
						events[i].attendence.push(attendendee);
					}
				}
			}
		}
		client.addAttendee({
			data: { 
				id:eventId, 
				person: attendendee
			},
		});
		this.forceUpdate();

	},
	render: function () {
		// console.log(this.handleIconClick);
		return (
			<div className='ui two column centered grid'>
				<div className='column'>
					<EditableEventList 
						events={this.state.data}
						people={this.state.allPeople}
						onFormSubmit={this.handleEditFormSubmit}
						onTrashClick={this.handleTrashClick}
						onIconClick={this.handleMinusClick}
						onStartClick={this.handleStartClick}
						onStopClick={this.handleStopClick}
						onAddAttendee={this.handleAddAttendee}
						onAddFamily={this.handleAddFamily}
						onNewPerson={this.handleCreatePerson}
					/>
					<ToggleableEventForm 
						onFormSubmit={this.handleCreateFormSubmit}
						onNewPerson={this.props.onNewPerson}
					/>
					<a href="/api/excel/events" target='_blank'>
						Download Events Excel file
					</a>
				</div>
			</div>
		);
	},
});

const EditableEventList = React.createClass({
	render: function() {
		// console.log(this.props.onIconClick);
		const events = this.props.events.map((event) => {
			return (
				<EditableEvent
					key={event.id}
					id={event.id}
					title={event.title}
					date={event.date}
					attendendees={event.attendence}
					people={this.props.people}
					elapsed={event.elapsed}
					runningSince={event.runningSince}
					onFormSubmit={this.props.onFormSubmit}
					onTrashClick={this.props.onTrashClick}
					onIconClick={this.props.onIconClick}
					onStartClick={this.props.onStartClick}
					onStopClick={this.props.onStopClick}
					onAddAttendee={this.props.onAddAttendee}
					onAddFamily={this.props.onAddFamily}
					onNewPerson={this.props.onNewPerson}
				/>
			);
		});
		return (
			<div id='events'>
				{events}
			</div>
		);
	},
});

const EditableEvent = React.createClass({
	getInitialState: function () {
		return (
			{
				editFormOpen: false,
			}
		);
	},
	handleEditClick: function () {
		this.openForm();
	},
	handleFormClose: function () {
		this.closeForm();
	},
	handleFormSubmit: function (event) {
		this.props.onFormSubmit(event);
		this.closeForm();
	},
	closeForm: function () {
		this.setState({ editFormOpen: false });
	},
	openForm: function () {
		this.setState({ editFormOpen: true });
	},
	handleIconClick: function (attendendeeId) {
		// console.log('attendendeeId:'+attendendeeId);
		this.props.onIconClick(this.props.id, attendendeeId);
	},
	handleAddFamily: function (familyGroup) {
		// console.log('attendendeeId:'+attendendeeId);
		this.props.onAddFamily(this.props.id, familyGroup);
	},
	handleAddAttendee: function (attendendeeId) {
		// console.log('attendendeeId:'+attendendeeId);
		this.props.onAddAttendee(this.props.id, attendendeeId);
	},
	handleCreatePerson: function (name) {
		var familyGroup = '';
		if(name.includes(' ')){
			var splitName = name.split(' ');
			familyGroup = splitName[splitName.length-1];
		}
		
		this.props.onNewPerson(name, familyGroup, this.props.id);
	},
	render: function () {
		if (this.state.editFormOpen) {
			return (
				<EventForm
					id={this.props.id}
					title={this.props.title}
					attendendees={this.props.attendendees}
					people={this.props.people}
					date={this.props.date}
					onFormSubmit={this.handleFormSubmit}
					onFormClose={this.handleFormClose}
					onIconClick={this.handleIconClick}
					onAddAttendee={this.handleAddAttendee}
					onAddFamily={this.handleAddFamily}
					onNewPerson={this.handleCreatePerson}
				/>
			);
		} else {
			return (
				<Event
					id={this.props.id}
					title={this.props.title}
					date={this.props.date}
					attendendees={this.props.attendendees}
					elapsed={this.props.elapsed}
					runningSince={this.props.runningSince}
					onEditClick={this.handleEditClick}
					onTrashClick={this.props.onTrashClick}
					onIconClick={this.handleIconClick}
				/>
			);
		}
	},
})

const EventForm = React.createClass({
	handleSubmit: function () {
		this.props.onFormSubmit({
			id: this.props.id,
			title: this.refs.title.value,
			date: this.refs.date.value,
		});
	},
	render: function () {
		// console.log(this.props);
		const submitText = this.props.id ? 'Update' : 'Create';
		return (
			<div className='ui centered card fluid'>
				<div className='content'>
					<div className='ui form'>
						<div className='field'>
							<label>Title</label>
							<input type='text' ref='title' defaultValue={this.props.title} />
						</div>
						<div className='field'>
							<label>Date</label>
							<input type='text' ref='date' defaultValue={this.props.date} />
						</div>
						<AttendendeesForm
							attendendees={this.props.attendendees}
							onIconClick={this.props.onIconClick}
							people={this.props.people}
							onAddAttendee={this.props.onAddAttendee}
							onAddFamily={this.props.onAddFamily}
							onNewPerson={this.props.onNewPerson}
						/>						
						<div className='ui two bottom attached buttons'>
							<button className='ui basic blue button'
									onClick={this.handleSubmit}
							>
								{submitText}
							</button>
							<button className='ui basic red button'
									onClick={this.props.onFormClose}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	},
});

const AttendendeesForm = React.createClass({
	getInitialState: function () {
		return {
			isOpen: false,
		};
	},
	handleFormOpen: function () {
		this.setState({ isOpen: true });
	},
	handleFormClose: function () {
		this.setState({ isOpen: false });
	},
	render: function() {
		const attendeesCount = this.props.attendendees ? this.props.attendendees.length : 0;
		// console.log(this.props);
		if (this.state.isOpen) {
			return (
				<div className='ui message'>
					<div className="label">
						Attendendees: {attendeesCount}
						<span 
							className='right floated edit icon'
							onClick={this.handleFormClose}
						>
							<i className='angle down icon'></i>
						</span>
					</div>
					<AttendendeesList
						attendendees={this.props.attendendees}
						onIconClick={this.props.onIconClick}
					/>
					<PersonInput
						personList={this.props.personList}
						onAddAttendee={this.props.onAddAttendee}
						onAddFamily={this.props.onAddFamily}
						onNewPerson={this.props.onNewPerson}
						people={this.props.people}
					/>
				</div>
			)
		} else {
			return (
				<div className='ui message'>
					<div className="label">
						Attendendees: {attendeesCount}
						<span 
							className='right floated edit icon'
							onClick={this.handleFormOpen}
						>
							<i className='angle right icon'></i>
						</span>
						<PersonInput
							personList={this.props.personList}
							onAddAttendee={this.props.onAddAttendee}
							onAddFamily={this.props.onAddFamily}
							onNewPerson={this.props.onNewPerson}
							people={this.props.people}
						/>
					</div>
				</div>
			)
		}
	},
});
const PersonInput = React.createClass({
	getInitialState: function () {
		return {
			buttonClass: 'ui icon button disabled',
			currentPeople:[]
		}
	},
	componentDidMount: function() {
		// this.loadPeopleFromServer();
		// setInterval(this.loadPeopleFromServer, 10000);
	},
	// loadPeopleFromServer: function () {
	// 	client.getPeople({
	// 		success: (data) => {
	// 			this.setState({allPeople: data});
	// 		},
	// 	});
	// },
	handleFamilyIconClick: function (familyGroup){
		this.props.onAddFamily(familyGroup);
	},
	handlePersonIconClick: function (personId){
		this.props.onAddAttendee(personId);
	},
	handleNewUserClick: function () {
		this.props.onNewPerson(this.refs.query.value);
	},
	onChangeHandler: function () {
		// console.log(this.refs.query.value);
		var query = this.refs.query.value;
		// console.log(this.props.people);
		var allPeople = this.props.people;
		var currentPeople = [];
		var currentFamilies = [];
		var queryCheck = false;
		if(query!='') {
			for (var i = 0; i < allPeople.length; i++) {
				var name = allPeople[i].name.toLowerCase();
				var familyname = allPeople[i].familyGroup.toLowerCase();
				if(name.includes(query.toLowerCase())) {
					queryCheck = true;
					currentPeople.push(allPeople[i]);
				}
				if(familyname.includes(query.toLowerCase())) {
					var uniqueCheck = true;
					queryCheck = true;
					// Loop through existing family groups so we have unique family groups
					if (currentFamilies.length>0) {
						for (var j = 0; j<currentFamilies.length; j++) {
							// console.log('b');
							var existingFamilyName = currentFamilies[j].familyGroup.toLowerCase();
							// console.log('existing'+existingFamilyName)
							if ( existingFamilyName.includes(query.toLowerCase()) ) {
								uniqueCheck = false;
							}
							if (uniqueCheck == true) {
								currentFamilies.push(allPeople[i]);
							}
						}
					} else {
						currentFamilies.push(allPeople[i]);
					}
				}
			}
		}
		if (queryCheck === true) {
			this.setState({ buttonClass: 'ui icon button disabled' });
		} else {
			this.setState({ buttonClass: 'ui icon button' });
		}
		this.setState({currentPeople: currentPeople});
		this.setState({currentFamilies: currentFamilies});
	},
	render: function() {
		// const personList = this.propes.personList.map
		return (
			<div>
				<div className="ui action input">
					<input 
						onChange={this.onChangeHandler} 
						type='text' 
						ref='query' 
						defaultValue='' 
						placeholder='Enter Names' 
					/>
					<button 
						className={this.state.buttonClass}
						onClick={this.handleNewUserClick}
					>
						<i className='user icon '></i> +
					</button>
				</div>
				<FamilySelector
					title='Families'
					people={this.state.currentFamilies}
					onIconClick={this.handleFamilyIconClick}
				/>
				<PeopleSelector
					title='People'
					people={this.state.currentPeople}
					onIconClick={this.handlePersonIconClick}
				/>
			</div>
		)
	},
});

const FamilySelector = React.createClass({
	render: function() {
		if(this.props.people != undefined && this.props.people.length > 0){
			// const field = this.props.field=='familyGroup' ? {this.props.familyGroup} : {this.props.name};
			const people = this.props.people.map((person) => {
				return (
					<Attendendee
						key={person.familyGroup}
						id={person.familyGroup}
						name={person.familyGroup}
						personId={person.familyGroup}
						onIconClick={this.props.onIconClick}
						icon='icon plus'
					/>
				)
			});
			return (
				<div>
					<h3>{this.props.title}</h3>
					<div className='ui list'>
						{people}
					</div>
				</div>
			);
		} else {
			return (
				<div></div>
			)
		}		
	},
});

const PeopleSelector = React.createClass({
	render: function() {
		if(this.props.people != undefined && this.props.people.length > 0){
			// const field = this.props.field=='familyGroup' ? {this.props.familyGroup} : {this.props.name};
			const people = this.props.people.map((person) => {
				return (
					<Attendendee
						key={person.id}
						id={person.id}
						name={person.name}
						personId={person.id}
						onIconClick={this.props.onIconClick}
						icon='icon plus'
					/>
				)
			});
			return (
				<div>
					<h3>{this.props.title}</h3>
					<div className='ui list'>
						{people}
					</div>
				</div>
			);
		} else {
			return (
				<div></div>
			)
		}		
	},
});

const AttendendeesList = React.createClass({
	render: function() {
		if(this.props.attendendees != undefined){
			const attendendees = this.props.attendendees.map((attendendee) => {
				return (
					<Attendendee
						key={attendendee.id}
						id={attendendee.id}
						name={attendendee.name}
						personId={attendendee.personId}
						onIconClick={this.props.onIconClick}
						icon='icon minus'
					/>
				)
			});
			return (
				<div className='ui list'>
					{attendendees}
				</div>
			);
		} else {
			return (
				<div className='ui list'>
					<div className='item'>No Attendendees</div>
				</div>
			)
		}		
	},
});

const Attendendee = React.createClass({
	handleIconClick: function () {
		// console.log(this.props);
		// console.log(this.props.key);
		this.props.onIconClick(this.props.personId);
	},
	render: function () {
		return (
			<div className='item'>
				{this.props.name}
				<span 
					className='right floated'
					onClick={this.handleIconClick}
				>
					<i className={this.props.icon}></i>
				</span>
			</div>
		)
	},
});

const ToggleableEventForm = React.createClass({
	getInitialState: function () {
		return {
			isOpen: false,
		};
	},
	handleFormOpen: function () {
		this.setState({ isOpen: true });
	},
	handleFormClose: function () {
		this.setState({ isOpen: false });
	},
	handleFormSubmit: function (event) {
		this.props.onFormSubmit(event);
		this.setState({ isOpen: false });
	},
	render: function () {
		if (this.state.isOpen) {
			return (
				<EventForm 
					onFormSubmit={this.handleFormSubmit}
					onFormClose={this.handleFormClose}
					onNewPerson={this.props.onNewPerson}
				/>
			);
		} else {
			return (
				<div className='ui basic content center aligned segment'>
					<button className='ui basic button icon'
							onClick={this.handleFormOpen}
					>
						<i className='plus icon'></i>
					</button>
				</div>
			);
		}
	},
});

const Event = React.createClass({
	componentDidMount: function () {
		this.forceUpdateInterval = setInterval(() => this.forceUpdate(), 50);
	},
	componentWillUnmount: function() {
		clearInterval(this.forceUpdateInterval);
	},
	handleTrashClick: function () {
		this.props.onTrashClick(this.props.id);
	},
	handleStartClick: function () {
		this.props.onStartClick(this.props.id);
	},
	handleStopClick: function () {
		this.props.onStopClick(this.props.id);
	},
	render: function () {
		const attendeesCount = this.props.attendendees ? this.props.attendendees.length : 0;
		return (
			<div className='ui centered card fluid'>
				<div className='content'>
					<div className='header'>
						{this.props.title}
					</div>
					<div className='meta'>
						Date: {this.props.date}
					</div>
					<div className='meta'>
						Attendendees: {attendeesCount} 
					</div>
					<div className='extra content'>
						<span 
							className='right floated edit icon'
							onClick={this.handleTrashClick}
						>
							<i className='trash icon'></i>
						</span>
					</div>
				</div>
				<div
					className='ui bottom attached blue basic button'
					onClick={this.props.onEditClick}
				>
					Edit
				</div>
			</div>
		);
	},
});

ReactDOM.render(
	<EventsDashboard />,
	document.getElementById('content')
);



