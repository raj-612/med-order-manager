const awsConfig = {
    Auth: {
        Cognito: {
            region: 'us-west-2', // e.g., 'us-east-1'
            userPoolId: 'us-west-2_f0mcJkTyJ',
            userPoolClientId: '7e735t6tkiauenbl0omqq4rm2g',
            loginWith: {
                oauth: {
                    domain: 'https://demo-user.auth.us-west-2.amazoncognito.com',
                    scopes: [
                      'phone',
                      'email',
                      'profile',
                      'openid',
                      'aws.cognito.signin.user.admin'
                    ],
                    redirectSignIn: [window.location.origin],
                    redirectSignOut: [window.location.origin],
                    responseType: "code",
                },
				email: true,
            }
        }
    }
};

export default awsConfig;
