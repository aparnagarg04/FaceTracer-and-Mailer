import React, { Component } from 'react';
import ParticlesBg from 'particles-bg';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Admin from './components/Admin/Admin';
import Eventpage from './components/Event/Eventpage';
import './App.css';

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: '',
    phonenumber:'',
    image:''
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined,
      phonenumber: data.phonenumber,
      image: data.image
    }})
  }

  // calculateFaceLocation = (data) => {
  //   const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
  //   const image = document.getElementById('inputimage');
  //   const width = Number(image.width);
  //   const height = Number(image.height);
  //   return {
  //     leftCol: clarifaiFace.left_col * width,
  //     topRow: clarifaiFace.top_row * height,
  //     rightCol: width - (clarifaiFace.right_col * width),
  //     bottomRow: height - (clarifaiFace.bottom_row * height)
  //   }
  // }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
      fetch('http://localhost:5000/imageurl', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })
      })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('http://localhost:5000/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
            })
            .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
      <ParticlesBg type="cobweb" bg={true} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
      {route === 'home' ? (
        <Eventpage onRouteChange={this.onRouteChange} />
      ) : route === 'signin' ? (
        <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
      ) : route === 'register' ? (
        <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
      // ) : route === 'Admin' ? (
      //   <Admin />
      ) : route === 'createEvent' ? (
        <div>
          {/* <Logo /> */}
          <h2 style={{ fontSize: '2.5rem', color: '#333', textAlign: 'center' }}>Event Details</h2>


          {/* <Rank
            name={this.state.user.name}
            entries={this.state.user.entries}
          /> */}
          <ImageLinkForm
            onInputChange={this.onInputChange}
            onButtonSubmit={this.onButtonSubmit}
          />
          {/* <FaceRecognition box={box} imageUrl={imageUrl} /> */}
        </div>
      ) : null}
    </div>
    );
  }
}

export default App;
