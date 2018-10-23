const IdamMockLogin = require('mocks/steps/idamLogin/IdamLogin.step');
const content = require('mocks/steps/idamLogin/IdamLogin.content');
const PetitionProgressBarPage = require('steps/petition-progress-bar/PetitionProgressBar.step');
const StartPageContent = require('steps/start/Start.content');

async function testIdamPage(success = true) {
  const I = this;

  I.amOnLoadedPage('/');
  I.navByClick(StartPageContent.en.startNow);

  const currentPath = await I.getCurrentUrl();

  if (currentPath !== PetitionProgressBarPage.path) {
    if (currentPath === IdamMockLogin.path) {
      I.seeCurrentUrlEquals(IdamMockLogin.path);
      if (success) {
        I.checkOption(content.en.fields.success.yes);
      } else {
        I.checkOption(content.en.fields.success.no);
      }
      I.navByClick('Continue');
    } else {
      I.seeInCurrentUrl('/login?');
      I.fillField('username', 'divdecreenisi@mailinator.com');
      I.fillField('password', 'Password21');
      I.navByClick('Sign in');
      I.wait(3);
    }
  }

  I.seeCurrentUrlEquals(PetitionProgressBarPage.path);
}

module.exports = { testIdamPage };
