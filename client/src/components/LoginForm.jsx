import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { loginUser } from '../utils/API';
import Auth from '../utils/auth';

const LoginForm = () => {
  const [userFormData, setUserFormData] = useState({ email: '', password: '' });
  const [validated, setValidated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    // Check if form is valid using HTML5 form validation
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true); // Set validated to true to trigger bootstrap validation styles
      setShowAlert(true); // Display the alert when form is invalid
      return;
    }

    // Try to log in the user with the formData
    try {
      const response = await loginUser(userFormData);
      if (!response.ok) throw new Error('Failed to log in!');
    
      const { token } = await response.json();
      Auth.login(token); // Assuming Auth.login() manages your session setting
      setUserFormData({ email: '', password: '' }); // Clear form data
      setShowAlert(false); // Hide alert on successful login
      setValidated(false); // Reset validation state
    } catch (err) {
      console.error(err);
      setShowAlert(true);
    }
  };

  return (
    <>
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant='danger'>
          Something went wrong with your login credentials!
        </Alert>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='email'>Email</Form.Label>
          <Form.Control
            type='email' 
            placeholder='Enter your email'
            name='email'
            onChange={handleInputChange}
            value={userFormData.email}
            required
          />
          <Form.Control.Feedback type='invalid'>Email is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='password'>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Enter your password'
            name='password'
            onChange={handleInputChange}
            value={userFormData.password}
            required
          />
          <Form.Control.Feedback type='invalid'>Password is required!</Form.Control.Feedback>
        </Form.Group>

        <Button
          disabled={!(userFormData.email && userFormData.password)}
          type='submit'
          variant='success'>
          Login
        </Button>
      </Form>
    </>
  );
};

export default LoginForm;
