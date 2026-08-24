import { test } from '../support/fixtures/playwright.js';

const quickQuestionIndexes = [0, 1, 2] as const;

test.beforeEach(() => {
  test.skip(
    process.env.RUN_LIVE_TESTS !== 'true',
    'Set RUN_LIVE_TESTS=true to call the public site',
  );
});

test('@live public homepage exposes the main customer entry point', async ({ homePage }) => {
  await homePage.open();

  await homePage.expectLoaded();
});

test('@live free-text question returns a LaBot answer', async ({ homePage, chatWidget }) => {
  const question = 'What is LabOS?';

  await homePage.open();
  await chatWidget.open();
  await chatWidget.ask(question);

  await chatWidget.expectAnswerTo(question);
});

for (const index of quickQuestionIndexes) {
  test(`@live quick question ${index + 1} returns a LaBot answer`, async ({
    homePage,
    chatWidget,
  }) => {
    await homePage.open();
    await chatWidget.open();
    const question = await chatWidget.chooseQuickQuestion(index);

    await chatWidget.expectAnswerTo(question);
  });
}
