import React, { Component } from 'react';

class ImageVerifier extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrl: '',
      verificationResult: null,
      error: null
    };
  }

  onImageUrlChange = (event) => {
    this.setState({
      imageUrl: event.target.value
    });
  };

  onVerifyClick = async () => {
    try {
      // Replace 'YOUR_API_ENDPOINT' with your actual API endpoint
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl: this.state.imageUrl })
      });

      if (!response.ok) {
        throw new Error('Failed to verify image');
      }

      const data = await response.json();
      this.setState({
        verificationResult: data.result,
        error: null
      });
    } catch (error) {
      this.setState({
        error: error.message,
        verificationResult: null
      });
    }
  };

  render() {
    return (
      <div className="mv3">
        <label className="db fw6 lh-copy f6" htmlFor="imageUrl">
          Image URL
        </label>
        <input
          className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
          type="text"
          name="imageUrl"
          id="imageUrl"
          value={this.state.imageUrl}
          onChange={this.onImageUrlChange}
        />
        <button onClick={this.onVerifyClick}>Verify</button>
        {this.state.verificationResult && (
          <p>Verification Result: {this.state.verificationResult}</p>
        )}
        {this.state.error && <p>Error: {this.state.error}</p>}
      </div>
    );
  }
}

export default ImageVerifier;
