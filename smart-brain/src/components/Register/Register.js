import React from "react";

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      mobile: "",
      email: "",
      password: "",
      imageUrl: "",
      imageFile: null,
      warningMessage: "",
    };
  }

  onNameChange = (event) => {
    this.setState({ name: event.target.value });
  };

  onEmailChange = (event) => {
    this.setState({ email: event.target.value });
  };

  onPasswordChange = (event) => {
    this.setState({ password: event.target.value });
  };

  onPhoneNumberChange = (event) => {
    this.setState({ mobile: event.target.value });
  };

  onImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      this.setState({ warningMessage: "No file selected" });
      return;
    }

    this.setState({ imageFile: file });

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch('http://127.0.0.1:5004/im_size', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      console.log('API response:', data);

      if (data.msg === 'success' && data.s3_url_list && data.s3_url_list.length > 0) {
        this.setState({ imageUrl: data.s3_url_list[0], warningMessage: "" });
        console.log('Image uploaded successfully:', data.s3_url_list[0]);
      } else {
        this.setState({ warningMessage: 'Image upload failed' });
      }
    } catch (error) {
      console.error('Error:', error);
      this.setState({ warningMessage: 'Error uploading image' });
    }
  };

  verifyingImage = async () => {
    const { imageFile } = this.state;
    if (!imageFile) {
      this.setState({
        warningMessage: "Please select an image file before verifying.",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch('http://127.0.0.1:5000/detect_faces', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch API');
      }

      const data = await response.json();
      console.log('API response:', data);

      if (data.num_faces === 1) {
        console.log('Single face detected. Proceed with registration.');
        this.setState({ warningMessage: '' });
      } else {
        this.setState({
          warningMessage: `Please upload a single face photo. Number of faces detected: ${data.num_faces}`
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  onSubmitSignIn = async () => {
    const { name, email, mobile, password, imageUrl } = this.state;

    if (!name || !email || !mobile || !password || !imageUrl) {
      this.setState({ warningMessage: 'Please fill in all fields and upload a verified image.' });
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          mobile,
          password,
          imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register user');
      }

      const user = await response.json();

      if (user.user_id) {
        this.props.loadUser(user);
        this.props.onRouteChange('home');
      }
    } catch (error) {
      console.error('Error:', error);
      this.setState({ warningMessage: 'Error registering user' });
    }
  };

  render() {
    return (
      <article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
        <main className="pa4 black-80">
          <div className="measure">
            <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
              <legend className="f1 fw6 ph0 mh0">Register</legend>
              <div className="mt3">
                <label className="db fw6 lh-copy f6" htmlFor="name">
                  Name
                </label>
                <input
                  className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                  name="name"
                  id="name"
                  onChange={this.onNameChange}
                />
              </div>
              <div className="mv3">
                <label className="db fw6 lh-copy f6" htmlFor="phonenumber">
                  Phone Number
                </label>
                <input
                  className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                  name="mobile"
                  id="mobile"
                  onChange={this.onPhoneNumberChange}
                />
              </div>
              <div className="mt3">
                <label className="db fw6 lh-copy f6" htmlFor="email-address">
                  Email
                </label>
                <input
                  className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                  name="email"
                  id="email"
                  onChange={this.onEmailChange}
                />
              </div>
              <div className="mv3">
                <label className="db fw6 lh-copy f6" htmlFor="password">
                  Password
                </label>
                <input
                  className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                  name="password"
                  id="password"
                  type="password"
                  onChange={this.onPasswordChange}
                />
              </div>
              <div className="mv3">
                <label className="db fw6 lh-copy f6" htmlFor="image">
                  Image
                </label>
                <input
                  className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                  type="file"
                  name="file"
                  id="file"
                  onChange={this.onImageChange}
                />
                <button onClick={this.verifyingImage}>Verify</button>
              </div>
            </fieldset>
            <div className="">
              <button
                onClick={this.onSubmitSignIn}
                className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                type="submit"
                value="Register"
              >
                Register
              </button>
            </div>
            {this.state.warningMessage && (
              <p className="warning">{this.state.warningMessage}</p>
            )}
          </div>
        </main>
      </article>
    );
  }
}

export default Register;
