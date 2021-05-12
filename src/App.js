import React from "react";
import logo from './logo.svg';
import './App.css';

export default class App extends React.Component {
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
			districtId : 312,
			optionItems : [],
			date : tomorrow,
			age: 18,
			availableCenters: []
		}
	}

	handleDistrictChange = (event) => {
		this.setState({districtId: event.target.value});
	}
	
	handleDateChange = (event) => {
		this.setState({date: event.target.value});
	}
	
	handleAgeChange = (event) => {
		this.setState({age: event.target.value});
	}
	
	notifyMe = () => {
		if (Notification.permission !== 'granted')
			Notification.requestPermission();
		else {
			setInterval( async () => {
				const url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=" + this.state.districtId + "&date=" + this.state.date;
				const response = await fetch(url);
				const data = await response.json();
				var centers = data.centers;
				var slotAvailableCenters = centers.filter((center) => {
					var sessions = center.sessions;
					for (var i = 0; i < sessions.length; i++){
						//console.log(session);
						if (sessions[i].min_age_limit === parseInt(this.state.age) && sessions[i].available_capacity > 0 ) {
							return true;
						}
					}
					return false;
				});
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
				}, 3500);
		}
	}
	
	async componentDidMount () {
			var items = [];
			const url = "https://cdn-api.co-vin.in/api/v2/admin/location/districts/20";
			const response = await fetch(url);
			const data = await response.json();
			const districts = data.districts;	 
			for (let i = 0; i < districts.length; i++) {
				// default to bhopal
				districts[i].district_id === 312 ?
				items.push(<option key={districts[i].district_id} value={districts[i].district_id} selected>{districts[i].district_name}</option>) :
				items.push(<option key={districts[i].district_id} value={districts[i].district_id}>{districts[i].district_name}</option>); 				
			}
			this.setState({optionItems: items});
		
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
		District ID: <select onChange={this.handleDistrictChange}>
            {this.state.optionItems}
        </select> <br/>
		Date(dd-mm-yyyy): <input type="text" value={this.state.date} onChange={this.handleDateChange}></input><br/>
		Slot for (18 or 45) age: <input type="text" value={this.state.age} onChange={this.handleAgeChange}></input><br/>
        <button onClick={this.notifyMe}>Notify me!</button>
</div>
<div>
            <h1 id='title'>Available Slots:</h1>
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
            </table>
         </div>
      </header>
    </div>
  );
  }
}

