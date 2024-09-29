import React from 'react';
import './ImageLinkForm.css';

class ImageLinkForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showImageUpload: false,
      selectedImage: null,
      eventName: '',
      emailId: '',
      eventOwner: '',
      eventId: '',
      imageData: null
    };
  }

  onImageChange = (event) => {
    const files = event.target.files;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }
    this.setState({ imageData: formData });
  };

  handleDetect = async () => {
    try {
      const formData = this.state.imageData;
      console.log('FormData:', formData);

      const response = await fetch('http://127.0.0.1:5002/sendphoto', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to send image.');
      }

      const data = await response.json();
      console.log(data);
      alert('Mail sent successfully!');
    } catch (error) {
      console.error('Error sending image:', error);
      alert('Failed to send image.');
    }
  };

  onSubmit = async () => {
    const { eventName, emailId, eventOwner,  } = this.state;
    const eventDetails = {
      event_name: eventName,
      email_id: emailId,
      event_owner: eventOwner,
      // event_id: eventId
    };

    try {
      const response = await fetch('http://127.0.0.1:5001/saveevent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventDetails)
      });

      if (!response.ok) {
        throw new Error('Failed to save event.');
      }

      const data = await response.json();
      console.log(data);
      alert('Event saved successfully!');
      this.setState({ showImageUpload: true }); // Show image upload section
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event.');
    }
  };

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { showImageUpload, selectedImage, eventName, emailId, eventOwner, eventId } = this.state;

    return (
      <div>
        <div className='center'>
          <div className='form center pa4 br3 shadow-5'>
            <input
              type="text"
              name="eventName"
              placeholder="Event Name"
              value={eventName}
              onChange={this.handleInputChange}
              className='pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100'
            />
            <input
              type="text"
              name="emailId"
              placeholder="Email ID"
              value={emailId}
              onChange={this.handleInputChange}
              className='pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100'
            />
            <input
              type="text"
              name="eventOwner"
              placeholder="Event Owner"
              value={eventOwner}
              onChange={this.handleInputChange}
              className='pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100'
            />
            {/* <input
              type="text"
              name="eventId"
              placeholder="Event ID"
              value={eventId}
              onChange={this.handleInputChange}
              className='pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100'
            /> */}
            <button
              className='w-30 grow f4 link ph3 pv2 dib white bg-light-purple'
              onClick={this.onSubmit}
            >
              Submit
            </button>
          </div>
        </div>

        {showImageUpload && (
          <div className='center mt4'>
            <div className='form center pa4 br3 shadow-5'>
              <input
                type="file"
                name="myImage"
                onChange={this.onImageChange}
                multiple
                className='pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100'
              />
              <button
                className='w-30 grow f4 link ph3 pv2 dib white bg-light-purple'
                onClick={this.handleDetect}
              >
                Upload Images
              </button>
            </div>
          </div>
        )}

        {selectedImage && (
          <div>
            <img
              alt="not found"
              width={"250px"}
              src={URL.createObjectURL(selectedImage)}
            />
            <br />
            <button onClick={() => this.setState({ selectedImage: null })}>Remove</button>
          </div>
        )}
      </div>
    );
  }
}

export default ImageLinkForm;
