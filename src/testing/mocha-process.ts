import { MochaCommand, MochaResponse } from './mocha';

import * as Mocha from 'mocha';

/* tslint:disable:no-var-requires no-require-imports */
require('source-map-support').install();

let sendResponse = (response: MochaResponse) => {
  process.send(response);
};

class CustomReporter {
  constructor(runner: any) {
    runner.on('fail', (
      test: { title: string, file: string },
      err: { message: string, stack: string }
    ) => {
      sendResponse({
        testResult: {
          fileName: test.file,
          title: test.title,
          error: err.message,
          stack: err.stack
        }
      });
    });

    runner.on('pass', (test: any) => {
      sendResponse({
        testResult: {
          fileName: test.file,
          title: test.title
        }
      });
    });
  }
}

let mocha = new Mocha({ reporter: CustomReporter } as any);

process.on('message', (msg: MochaCommand) => {
  msg.testFiles.forEach(testFile => {
    mocha.addFile(testFile);
  });
  mocha.run((failures: number) => {
    sendResponse({ finished: { success: failures === 0 } });
    process.exit(0);
  });
});
