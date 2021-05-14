import React from "react";
import logo from './logo.svg';
import './App.css';

export default class App extends React.Component {
	intervalID = 0;
	constructor() {
		super();
		//set default date
		var tomorrow = new Date();
		tomorrow.setDate(new Date().getDate()+1);
		var dd = String(tomorrow.getDate()).padStart(2, '0');
		var mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
		var yyyy = tomorrow.getFullYear();

		tomorrow = dd + '-' + mm + '-' + yyyy;
		this.state={
			districtId : 0,
			optionItems : [],
			date : tomorrow,
			age: 18,
			availableCenters: [],
			stateId : 0,
			stateOptionItems : []
		}
	}

	updateDistrictOnStateChange = () => {
		setTimeout( async () => {
		var items = [];
			const url = "https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + this.state.stateId;
			const response = await fetch(url);
			const data = await response.json();
			const districts = data.districts;	 
			for (let i = 0; i < districts.length; i++) {
				// default to bhopal
				if (i === 0 ) {
					items.push(<option key={districts[i].district_id} value={districts[i].district_id} selected>{districts[i].district_name}</option>);
					this.setState({districtId: districts[i].district_id});
				} else {				
					items.push(<option key={districts[i].district_id} value={districts[i].district_id}>{districts[i].district_name}</option>); 				
				}
			}
			this.setState({optionItems: items});
			
		}, 0);
	}

	handleStateChange = (event) => {
		this.setState({stateId: event.target.value});
		this.updateDistrictOnStateChange();
	}

	handleDistrictChange = (event) => {
		this.setState({districtId: event.target.value});
	}
	
	handleDateChange = (event) => {
		var changedDate = new Date(Date.parse(event.target.value));
		var dd = String(changedDate.getDate()).padStart(2, '0');
		var mm = String(changedDate.getMonth() + 1).padStart(2, '0');
		var yyyy = changedDate.getFullYear();

		changedDate = dd + '-' + mm + '-' + yyyy;
		this.setState({date: changedDate});
	}
	
	handleAgeChange = (event) => {
		this.setState({age: parseInt(event.target.value)});
	}
	
	notifyMe = () => {
		if (Notification.permission !== 'granted') {
			Notification.requestPermission();
		}
		else {
			if (this.intervalID) {
				clearInterval(this.intervalID);
			}
			this.intervalID = setInterval( async () => {
				const url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=" + this.state.districtId + "&date=" + this.state.date;
				const response = await fetch(url);
				const data = await response.json();
				var centers = data.centers;
				var slotAvailableCenters = centers.filter((center) => {
					var sessions = center.sessions;
					for (var i = 0; i < sessions.length; i++){
						//console.log(session);
						if (sessions[i].min_age_limit === this.state.age && sessions[i].available_capacity > 0 ) {
							return true;
						}
					}
					return false;
				});
				if (JSON.stringify(this.state.availableCenters) !== JSON.stringify(slotAvailableCenters)) {
					// result changed
					this.setState({availableCenters: slotAvailableCenters});
					console.log(slotAvailableCenters);
					if (slotAvailableCenters.length > 0) {
						var notification = new Notification(this.state.age + '+ vaccine slot avaiable.', {
						   icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
						   body: 'Click this notification to go to CoWin!',
						  });
						  notification.onclick = function() {
								window.open('https://selfregistration.cowin.gov.in/');
						  };
					}
				}
				}, 3500);
			alert('Desktop notificaton enabled!!\nYou can minimize the browser or switch between multiple tabs but don\'t close this tab.\nAlso just keep only one instance of this website open per machine.');
		}
	}
	
	async componentDidMount () {
		
		var stateItems = [];
		const urlStates = "https://cdn-api.co-vin.in/api/v2/admin/location/states";
		const stateResponse = await fetch(urlStates);
		const stateData = await stateResponse.json();
		const states = stateData.states;
		for (let i = 0; i < states.length; i++) {
			// default to M.P.
			states[i].state_id === 20 ?
			stateItems.push(<option key={states[i].state_id} value={states[i].state_id} selected>{states[i].state_name}</option>) :
			stateItems.push(<option key={states[i].state_id} value={states[i].state_id}>{states[i].state_name}</option>); 				
		}
		this.setState({stateOptionItems: stateItems});
		this.setState({stateId: 20});
		this.updateDistrictOnStateChange();
		
		if (!Notification) {
		  alert('Desktop notifications not available in your browser. Try Chromium.');
		  return;
		 }

		if (Notification.permission !== 'granted') {
		  Notification.requestPermission();
		}
	}

renderTableData = () => {
	var tableRows = [];
	var centers = this.state.availableCenters;
	for (var i = 0; i < centers.length; i++) {
		
		var sessions = centers[i].sessions;
		var sum = 0
		for (var j = 0; j < sessions.length; j++){
			sum += sum + sessions[j].available_capacity;
		}
		
		tableRows.push(<tr key={centers[i].center_id}>
               <td>{centers[i].center_id}</td>
			   <td>{centers[i].name}</td>
               <td>{centers[i].address}</td>
			   <td>{centers[i].block_name}</td>
               <td style={{backgroundColor: "lightgreen", color: "green"}}>{sum}</td>
            </tr>);
	}
	return tableRows;
    
}

  render() {
	return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
<div>
		State <select onChange={this.handleStateChange}>
            {this.state.stateOptionItems}
        </select> <br/>
		District <select onChange={this.handleDistrictChange}>
            {this.state.optionItems}
        </select> <br/>
		Date: <input type="date" onChange={this.handleDateChange}/><br/>
		Slot for age: <select onChange={this.handleAgeChange}>
            <option key={18} value={18} selected>18</option>
			<option key={45} value={45}>45</option>
        </select> <br/>
        <button onClick={this.notifyMe}>Notify me!</button>
</div>
<div>
<br/>
            <span>Available Slots:</span> {(this.state.availableCenters.length > 0) ? 
			<React.Fragment>
			<span style={{color:'green'}}> Available</span> 
            <table id='results' border={1} style={{borderCollapse:'collapse'}}>
			<thead>
			<tr>
				<th>
				Center Id
				</th>
				<th>
				Center Name
				</th>
				<th>
				Center Address
				</th>
				<th>
				Block Name
				</th>
				<th>
				Available Capacity
				</th>
			</tr>
			</thead>
				<tbody>
                  {this.renderTableData()}
               </tbody>
            </table> </React.Fragment>
			: <span style={{color:'red'}}> Not Available</span> }
         </div>
      </header>
    </div>
  );
  }
}

