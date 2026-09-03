import { _mock } from 'src/_mock';

// To get the user from the <AuthContext/>, you can use

// Change:
// import { useMockedUser } from 'src/auth/hooks';
// const { user } = useAuthContext();

// To:
// import { useAuthContext } from 'src/auth/hooks';
// const { user } = useAuthContext();

// ----------------------------------------------------------------------

export function useMockedUser() {
  const user = {
    id: '8864c717-587d-472a-929a-8e5f298024da-0',
    displayName: 'Alish Palasara',
    email: 'Alish@transport.cc',
    photoURL: _mock.image.avatar(24),
    phoneNumber: _mock.phoneNumber(1),
    country: _mock.countryNames(1),
    address: '90210 Broadway Blvd',
    state: 'California',
    city: 'San Francisco',
    zipCode: '94116',
    about: 'Praesent turpis. Phasellus viverra nulla ut metus varius laoreet. Phasellus tempus.',
    role: 'user',
    isPublic: true,
  };

  // accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NGFiNzg0N2U3ZGRkNjlhZTRlMTNkMCIsImlhdCI6MTczMzE3MTU4MywiZXhwIjoxNzM2NjI3NTgzfQ.puFWvqQVT7M-IVnQ-prgPVOlSF7mSkUZc5Fn4mRRRyI';
  // email: 'demo@transport.cc';
  // isAdmin: true;
  // name: 'Demo';
  // role: 'admin';
  // _id: '674ab7847e7ddd69ae4e13d0';

  return { user };
}
