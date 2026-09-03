import axios, { endpoints } from 'src/utils/axios';

import { setSession } from './utils';

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }) => {
  try {
    const params = { email, password };

    const res = await axios.post(endpoints.auth.signIn, params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    setSession(accessToken);
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  name,
  email,
  mobile,
  password,
  pharmacyName,
  dlNumber = '',
  gstNumber = '',
  address = '',
  city = '',
  state = '',
  pincode = '',
  firstName,
  lastName,
}) => {
  const resolvedName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'Pharmacy Admin';
  const params = {
    name: resolvedName,
    email,
    mobile: mobile || '9876543210',
    password,
    pharmacyName: pharmacyName || `${resolvedName}'s Pharmacy`,
    dlNumber,
    gstNumber,
    address,
    city,
    state,
    pincode,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    setSession(accessToken);
    return res.data;
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async () => {
  try {
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};

/** **************************************
 * Request WhatsApp OTP
 * ************************************** */
export const requestWhatsAppOTP = async ({ mobile }) => {
  try {
    const res = await axios.post(endpoints.auth.whatsappOtp, { mobile });
    return res.data;
  } catch (error) {
    console.error('Error requesting WhatsApp OTP:', error);
    throw error;
  }
};

/** **************************************
 * Verify WhatsApp OTP
 * ************************************** */
export const verifyWhatsAppOTP = async ({ mobile, code }) => {
  try {
    const res = await axios.post(endpoints.auth.whatsappVerify, { mobile, code });
    const { accessToken } = res.data;
    if (!accessToken) {
      throw new Error('Access token not found in response');
    }
    setSession(accessToken);
    return res.data;
  } catch (error) {
    console.error('Error verifying WhatsApp OTP:', error);
    throw error;
  }
};
