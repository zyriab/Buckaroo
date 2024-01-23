<p align="center"><img
  src="logo.svg"
  alt="buckaroo logo" /></p>
 
 <p align="center">
 <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/ZyriabDsgn/buckaroo">
<img alt="GitHub code size in bytes" src="https://img.shields.io/github/languages/code-size/zyriabdsgn/buckaroo">
<img alt="GitHub" src="https://img.shields.io/github/license/zyriabdsgn/buckaroo">
</p>

A serverless miniservice wrapping AWS S3 SDK to manage files easily.

## Installation

_This guide assumes you have basic knowledge about NPM (also that it's installed) and possess an AWS and Auth0 accounts._

Automatic CI/CD using GH Actions is not covered in this readme.

First you need to clone this repo, then you can follow along the instructions below 😉

### Auth0

**Note**: You can also remove the authentication from Buckaroo (it's just an Express middleware you can tweak).

_Buckaroo pairs up with your frontend, both should use Auth0 for authentication/authorization and be in the same tenant._

First of, you need to create an API in the Auth0 dashboard, you can follow [this tutorial](https://auth0.com/docs/quickstart/spa/vanillajs/02-calling-an-api) to get it done.

In the API's settings:

- Make sure "Enable RBAC" is enabled
- Make sure "Add Permissions in the Access Token" is enabled

In the "Permissions" tab, add the following:

| Permission       | Description                                           |
| ---------------- | ----------------------------------------------------- |
| read:bucket      | LIST an entire bucket                                 |
| create:file      | POST or PUT a file in a bucket                        |
| update:file      | RESTORE a file in a bucket (internally COPY + DELETE) |
| delete:file      | DELETE a file in a directory                          |
| delete:directory | DELETE a directory in a bucket                        |
| read:file        | read content of a file                                |

Click on "Actions > Library" on the left side menu.

- Click on "Build Custom"

  - Name: Add app metadata to access token
  - Trigger: Login / Post Login
  - Runtime: Node 16
  - Past the following code (don't forget to add your custom namespace):

```js
exports.onExecutePostLogin = async (event, api) => {
  if (event.client.metadata) {
    const namespace = 'https://your.namespace.com';
    api.accessToken.setCustomClaim(
      `${namespace}/app_metadata`,
      event.client.metadata
    );
  }
};
```

- Name: Add user email to access token
  - Trigger: Login / Post Login
  - Runtime: Node 16
  - Past the following code (don't forget to add your custom namespace):

```js
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://your.namespace.com';
  api.accessToken.setCustomClaim(`${namespace}/email`, event.user.email);
};
```

- Name: Add username to access token
  - Trigger: Login / Post Login
  - Runtime: Node 16
  - Past the following code (don't forget to add your custom namespace):

```js
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://your.namespace.com';
  api.accessToken.setCustomClaim(`${namespace}/username`, event.user.nickname);
};
```

**Don't forget to click "Deploy" once you pasted the code.**

Now, click on "Actions > Flows"

- Select "Login"
- On the right menu, select the "Custom" tab
- Drag and drop the 3 actions you created earlier in the flow (under "Start")
- Click "Apply"

_This will make sure that every app in this tenant applies those actions on login._

Lastly, in Buckaroo source code, go to `src/helpers/contants.help.ts`, remove the currently set domains and add your own.

The key of the map is the name of the tenant (sent by the frontend), the value is the Auth0 tenant domain (from the Auth0 dashboard).

i.e.: `AUTH0_DOMAINS.set('shopicsv', 'my-domain.eu.auth0.com');`

This map is used in order to use Buckaroo with multiple Auth0 tenants.

### AWS IAM

These are the steps to create a IAM user with permission to work with your S3 Buckets

- On the left menu, click "Users"
  - Click "Add users"
    - User name: Whatever you want (i.e.: "S3-versioning-controller")
    - Check: `Access key - Programmatic access`
    - Click "Next: Permissions"
    - Select "Attach existing policies directly", then click on "Create policy"
    - For the sake of simplicity, select `AmazonS3FullAccess` (**note**: It is recommended that you create a new policy, giving the minimum permissions required).
    - Copy/Paste the policy below these steps.
    - Click "Next" twice, review the user you created
    - Click "Create user"
    - Copy and keep in a text file the "Access key ID" and "Secret access key" (**keep the later absolutely secret, don't put it on a github repo or anything!**)

Buckaroo's policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": [
        "s3:ReplicateObject",
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListAllMyBuckets",
        "s3:DeleteObjectVersion",
        "s3:ListBucketVersions",
        "s3:RestoreObject",
        "s3:ListBucket",
        "s3:GetBucketVersioning",
        "s3:DeleteObject",
        "s3:ReplicateDelete",
        "s3:GetObjectVersion"
      ],
      "Resource": "*"
    }
  ]
}
```

### AWS Lambda

These are the steps to set up a Lambda function in order to host the API.

1. Go to the AWS console and log in.
2. Go to the Lambda functions console and create a new function.
3. Set the following settings:

   - Function name: `buckaroo` (you can call it whatever you want, but the workflows are set up for this name, if you decide to go this route).
   - Runtime: Node.js
   - Architecture: x86_64
   - Advanced settings:
     - Check: "Enable function URL".
     - Auth type: "NONE".
     - Check "Configure cross-origin resource sharing (CORS)"

4. In the tab "Configuration":

   - Function URL: click "Edit" on the top-right.
     - Allow origin: You can add your domains (one per line) or keep the wildcard character (\*) in order to allow all origins (not recommended)
     - Under "Allow headers", click "Add new value" and type in `content-type` and `authorization`.
     - Under "Allow methods", check "POST".

5. In the "Environment variables" menu section (on the left):
   **Note:** You can find more information about the uses of environment variables in the "Usage" section.

   - Click "Edit" then "Add environment variable"
   - Add the following:
     - Key: `NODE_ENV`
     - Value: `production`
     - Key: `AES_KEY`
     - Value: A randomly generated AES key
     - Key: `NAMESPACE`
     - Value: `your.namespace.com` (from the actions you created in Auth0)
     - Key: `BUCKET_NAMESPACE` (optional, leave empty string if not needed)
     - Value: `optional-namespace-`
     - Key: `AUTH0_AUDIENCE`
     - Value: `https://example.express`
     - Key: `S3_REGION`
     - Value: `AWS_REGION` (i.e.: eu-central-1)
     - Key: `S3_ACCESS_KEY_ID`
     - Value: ``
     - Key: `S3_SECRET_ACCESS_KEY`
     - Value: ``

6. Don't forget to note the function URL, we'll use it to call the API from the frontend.

### API directory

These are the steps to automatically bundle the API's code in one big JS file and deploy it manually on Lambda. You can also use AWS CLI or automate the deployment when you push your code on your GitHub repo, by using the included action `deploy.yml` but that's outside the scope of this readme, feel free to do some research about it (most of the work is already done).

1. In your terminal, go the project's directory.
2. Run the command `npm i` in order to install all the project's dependencies.
3. Run `npm run build`.
4. Move the file `index.js` from the newly created `dist/` folder to the root folder of the project.
5. Select the file `index.js` and compress it into a .zip file.
6. Go back to the AWS Lambda function dashboard.
7. In the "Code" tab (top-right of the editor), select "Upload from > .zip file" and upload the .zip file.

## Usage

You can now call the Lambda URL, passing your query as a POST request (see example below).

You can find the queries and mutations in `src/schema/schema.graphql`.
(gqlSchema.ts is pasted from that file in order to comply with `ncc`'s limitations).

You can find the already implemented queries and mutations in `src/resolvers/resolvers.ts`.

Check out [Buckaroo SDK](https://github.com/zyriabdsgn/buckaroo-sdk) to see how to interact with Buckaroo from your frontend.

If you want to test the API locally you can run `npm run dev` in the API's directory and check the debug console for any error, don't forget to create a `.env` file (or remove the "example" from `.env.example`) and put in the following lines:

- `NODE_ENV=development`
- `PORT=3000` <-- Feel free to change this value if this port is already in use.
- `AES_KEY=your_aes_key`
- `NAMESPACE=your.namespace.com`
- `BUCKET_NAMESPACE=optional-namespace-` (if not needed, leave an empty string)
- `AUTH0_AUDIENCE=https://example.express`
- `S3_REGION=AWS_REGION` (i.e.: eu-central-1)
- `S3_ACCESS_KEY_ID=XXXXXXXXXXXXXX`
- `S3_SECRET_ACCESS_KEY=XXXXXXXXXXXXXX`

### Meaning and usage of each environment variable

- `NODE_ENV` - Represents the current environment, will be used to determine if the bucket's name needs "dev" or "staging" at the end of its name (check `getTenant.ts`)
- `AES_KEY` - Used to encrypt/decrypt the tenant's name from the request body
- `NAMESPACE` - Auth0 actions namespace
- `BUCKET_NAMESPACE` - Optional namespace, will be added before the bucket's name
- `AUTH0_AUDIENCE` - API's audience in the Auth0 dashboard
- `S3_REGION` - Region in which your IAM user has been created
- `S3_ACCESS_KEY_ID` - Access key ID of the IAM user
- `S3_SECRET_ACCESS_KEY` - Secret access key of the IAM user

## Contributing

Feel free to send a PR, this is a work in progress and if you spot any error in the code or README, I would appreciate your help 🙂

## License

This software is under the [MIT](https://choosealicense.com/licenses/mit/) license, a short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code. (Do whatever you want with it 🤙).<br/><br/>

                  ,,))))))));,
               __)))))))))))))),
              -\(((((''''((((((((.
               ((''  .     `)))))),
             ))| o    ;-.    '(((((                                  ,(,
             ( `|    /  )    ;))))'                               ,_))^;(~
                |   |   |   ,))((((_     _____------~~~-.        %,;(;(>';'~
                o_);   ;    )))(((` ~---~  `::           \      %%~~)(v;(`('~
                      ;    ''''````         `:       `:::|\,__,%%    );`'; ~
                     |   _                )     /      `:|`----'     `-'
               ______/\/~    |                 /        /
             /~;;.____/;;'  /          ___--,-(   `;;;/
            / //  _;______;'------~~~~~    /;;/\    /
           //  | |                        / ;   \;;,\
          (<_  | ;                      /',/-----'  _>
           \_| ||_                     //~;~~~~~~~~~
               `\_|                   (,~~
                                       \~\
                                        ~~
