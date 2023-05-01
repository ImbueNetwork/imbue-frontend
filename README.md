<a href="https://github.com/w3f/Grants-Program/pull/703"><img src="https://github.com/ImbueNetwork/website-assets/blob/main/Web3%20Foundation%20Grants%20Badge/PNG/web3%20foundation_grants_badge_black.png?raw=true" alt="imbue-web3-open-grant" /></a>

# Imbue-frontend App Documentation

## Introduction

Imbue Network is a decentralised crowdfunding DAO and a market place for freelancers built on top of the Polkadot blockchain platform. It is an idea incubator open to the entire world that allows anyone, from any walk of life and for any kind of endeavour, to submit and vote on 
Ideas worth funding from the communities that believe in them the most. Imbue-fronted app is a web application that allows users to interact with the Imbue Network blockchain. It is built using React,NEXT.js,Polkadot.js, and other related technologies. 

## Installation

### Local deployment quickstart with docker-compose
We make sure that the app is easy to deploy locally. To do so, we have created a docker-compose file that will allow you to deploy the app locally with a single command. 
follow these steps:

1. Make sure you have docker and docker-compose installed on your computer.
2. Clone the app's repository from GitHub: `git clone https://github.com/ImbueNetwork/imbue-frontend.git`.
3. Navigate to the app's directory: `cd imbue-frontend`.
4. Run the docker-compose command: `docker-compose up -d`.
5. We are using make file for quick setup of db and migrations. 
6. Run the make command: `make db_up` and `make seed` . It will create the database and run the migrations to populate the table with some dummy data.
7. Install the app's dependencies: `yarn `.

### Configuration

The app's configuration is stored in environment variables. The following variables are available:

- `PORT`: The port number to use for the app's server.
- `IMBUE_NETWORK_WEBSOCK_ADDR`: The address of the Imbue Network websocket endpoint.
- `RELAY_CHAIN_WEBSOCK_ADDR`: The address of the Polkadot websocket endpoint.
- `DB_HOST`: The host address of the database.
- `DB_PORT`: The port number of the database.
- `DB_USER`: The username of the database.
- `DB_PASSWORD`: The password of the database.
- `DB_NAME`: The name of the database.

### Running the app 

1. Start the app's development server: `yarn dev`.
2. Open the app in a web browser: `http://localhost:3000`.
3. You can see the app is running 

To modify the app's configuration, create a `.env` file in the app's root directory and specify the desired values for each variable.

## Usage/Testing

#### Here we will go through how you can play with your app and test it's functionalities.
 - Step 1: Go to the http://localhost:3000/ and you will see the following page.
          <img src="./public/readme/images/main.png" alt="Alt text" width="700" height="400">

 - Step 2: click on the right-side menu as shown in the image above, and you will see the following page.
           here you see a lot of options, we will go over them one by one.
          <img src="./public/readme/images/signupOptions.png" alt="Alt text" width="700" height="400">

 - Step 3: First we have to log in and you can click in the login button. We have multiple options to signup using your email, google account or 
            can use any supported wallet  to login.
   - For the login via email. Click on the signup button, enter your details and click on the create account button. 
     <img src="./public/readme/images/signup.png" alt="Alt text" width="700" height="400">
   <br/><br/>
   - With the Google signup you can just click on the ```Sign in  with Google``` button, and it will redirect you to the Google login page, 
            where you can enter your Google credentials and login
   <br/><br/>
   - For the options with the wallet we can choose from different wallets as shown below
     <img src="./public/readme/images/walletOptions.png" alt="Alt text" width="700" height="400">
        - For any of the extension wallet, you can download the extension from the chrome store and 
           then click on the signin with the given supported wallet. Here we will go over polkadotjs extension wallet
   <br/><br/>
   - For polkadotjs(or any substrate based wallet, here we will be showing with the polkadotjs extension), click on the signin with polkadotjs extension
     you will see something like shown below which is list of accounts in your wallet, please select any one of them and signin as shown below
     <img src="./public/readme/images/walletAccountList.png" alt="Alt text" width="700" height="600">
   <br/><br/>
     <img src="./public/readme/images/walletSign.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 4: Upon successful signin, you will be redirected to the dashboard page, as shown in the image below.
          <img src="./public/readme/images/dashboard.png" alt="Alt text" width="700" height="400">
   <br/><br/>
### Going through the various flows  
 
#### Brief Flow  

##### Viewing briefs
 - Step 1: From the dashboard view you either click into the freelancer view or go the menu and click the discover 
          briefs button, as shown below
   <br/><br/>
   <img src="./public/readme/images/freelancerView.png" alt="Alt text" width="700" height="400">
   <br/><br/>
   <img src="./public/readme/images/dashboardMainMenu.png" alt="Alt text" width="700" height="400">
 - Step 2: Once you click you can see the list of briefs as shown below
   <br/><br/>
   <img src="./public/readme/images/discoverBriefs.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 3: You can go through all the briefs can also filter through based in certain criteria and 
     click on the search button as shown below to apply the filters
   <br/><br/>
   <img src="./public/readme/images/briefFiltering.png" alt="Alt text" width="700" height="400">
   <br/><br/>
##### Submitting/Posting a brief
 - Step 1: From the dashboard view you either click into the client view or go the menu and click the post 
          briefs button, as shown below
   <br/><br/>
   <img src="./public/readme/images/dashboardClientView.png" alt="Alt text" width="700" height="400">
   <br/><br/>
   <img src="./public/readme/images/dashboardMainMenu.png" alt="Alt text" width="700" height="400">
 - Step 2: Now you can click either ```Post a Brief``` from the Client View or ```Submit a Brief``` from the main menu. You will see the 
           below screen
   <br/><br/>
   <img src="./public/readme/images/briefHeadline.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 3: Enter the headline and click next to enter the industry you project falls under as shown below 
   <br/><br/>
   <img src="./public/readme/images/briefProjectIndustry.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 4: Enter the industry and click next to enter the description for your project
   <br/><br/>
   <img src="./public/readme/images/briefProjectDescription.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 5: Enter the description and click next to enter the skills required for your project
   <br/><br/>
   <img src="./public/readme/images/briefSkills.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 6: Enter the skills and click next to enter experience level required
   <br/><br/>
   <img src="./public/readme/images/briefExperience.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 7: Enter the experience level and click next to enter the scope for your project
   <br/><br/>
   <img src="./public/readme/images/briefScope.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 8: Enter the scope and click next to enter the estimate about how long your project will take
   <br/><br/>
   <img src="./public/readme/images/briefTimeEstimate.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 9: Enter the time estimate and click next to enter the budget for your project
   <br/><br/>
   <img src="./public/readme/images/briefBudget.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 10: Enter the budget and submit and you will be shown the thank you page
   <br/><br/>
   <img src="./public/readme/images/briefThanks.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 11: You can now go to the discover briefs page and see your brief listed there as shown below
   <br/><br/>
   <img src="./public/readme/images/briefList.png" alt="Alt text" width="700" height="400">
   <br/><br/>

Once you have posted a brief, any freelancer can submit a proposal for the brief and its on the brief creator to accept or reject the proposal.
Before we can go through the proposal flow, we need to go through the freelancer flow.

#### Freelancer Flow

##### Creating the freelancer profile
Before you can submit a proposal for a brief you need to have a freelancer profile created

 - Step 1: From the dashboard view go the menu and click the ```Join 
          the freelancer``` button, as shown below
   <br/><br/>
   <img src="./public/readme/images/freelancerJoinMenu.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 2: Upon clicking you will be redirected to the freelancer profile creation getting started page as, and you can click the ```Get Started``` button.
           You will be asked about your skills and experience in the next pages
   <br/><br/>
   <img src="./public/readme/images/freelancerGettingStarted.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 3: Next page after clicking ```Get Started``` button, you will be asked whether you have freelanced before as shown below
   <br/><br/>
   <img src="./public/readme/images/freelancedBefore.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 4: Select your option and click next to enter about your freelancing goals
   <br/><br/>
   <img src="./public/readme/images/freelancingGoal.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 5: Click next to enter the title for freelancing profile
   <br/><br/>
   <img src="./public/readme/images/freelancerTitle.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 6: Enter the title and click next to enter the languages you know
   <br/><br/>
   <img src="./public/readme/images/freelancerLanguages.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 7: Enter the languages and click next to enter the skills you have
   <br/><br/>
   <img src="./public/readme/images/freelancerSkills.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 8: Enter the skills and click next to enter a brief bio about yourself
   <br/><br/>
   <img src="./public/readme/images/freelancerTitle.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 9: Enter the bio and click next to enter the main services you offer
   <br/><br/>
   <img src="./public/readme/images/freelancerServices.png" alt="Alt text" width="700" height="400">
   <br/><br/>
 - Step 10: Enter the services and click Submit, you will be shown with the Done page, and from there you can go to the Discover briefs page
   <br/><br/>
   <img src="./public/readme/images/freelancerDone.png" alt="Alt text" width="700" height="400">
   <br/><br/>

## Resources

Here are some resources for learning more about NextJS and related technologies:

- [Official Next.js documentation](https://nextjs.org/docs)
- [Next.js tutorial on the Vercel website](https://vercel.com/guides/nextjs-getting-started)
- [React documentation](https://reactjs.org/docs)
- [JavaScript documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## Troubleshooting

If you encounter any issues while using imbue-frontend App, try these troubleshooting steps:

1. Check the app's logs for error messages or stack
2. Check the app's configuration to make sure it is correct
3. Check the app's dependencies to make sure they are installed correctly
4. Check the app's environment to make sure it is configured correctly
5. You can always contact us [here](https://t.me/ImbueNetwork) if you are still facing the issue after trying the available troubleshooting steps.
