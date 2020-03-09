import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	// get extention configrations
	const config = vscode.workspace.getConfiguration('mobprotimer');
	const configInterval = config.get<number>('interval');

	// extension setting
	const MARK_START = '$(debug-start)';
	const MARK_PAUSE = '$(debug-pause)';
	const COLOR1 = '#FFFFFFFF';
	const COLOR2 = '#FFFF00FF';
	const COLOR3 = '#FF0000FF';

	// init timer
	const initTimer = () => (configInterval ? configInterval : 10)  * 60;
	const clearTimerInterval = () => {
		clearInterval(interval);
		interval.unref();
	};
	// zero padding
	const padding = (val: number) => val.toString().padStart(2, '0');
	// set status bar text
	const itemText = (mark: string) => {
		if (time <= 10) {
			item.color = COLOR3;
		} else if (time <= 60) {
			item.color = COLOR2;
		} else {
			item.color = COLOR1;
		}

		const h = Math.floor(time / (60 * 60));
		const m = Math.floor((time - (h * 60 * 60)) / 60);
		const s = time - (h * 60 * 60) - (m * 60);
		item.text = `${mark} ${padding(h)}:${padding(m)}:${padding(s)}`;
	};

	let interval: NodeJS.Timeout;
	let time = initTimer();

	const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 999);
	itemText(MARK_START);
	item.color = COLOR1;
	item.show();

	// start timer
	const start = vscode.commands.registerCommand('extension.start', () => {
		if (interval !== undefined) {
			clearTimerInterval();
		}

		item.command = 'extension.pause';
		item.tooltip = 'pause timer';
		itemText(MARK_PAUSE);

		interval = setInterval(() => {
			time--;
			itemText(MARK_PAUSE);
			if (time === 0) {
				time = initTimer();

				clearTimerInterval();
				vscode.window.showInformationMessage("Time is Up!!", {
					modal: true,
				}).then(
					() => {
						vscode.commands.executeCommand('extension.start');
					},
					() => {}
				);
				return;
			}
		}, 1000);
	});

	// pause timer
	const pause = vscode.commands.registerCommand('extension.pause', () => {
		item.command = 'extension.start';
		item.tooltip = 'start timer';
		clearTimerInterval();
		itemText(MARK_START);
	});

	// reset timer
	const reset = vscode.commands.registerCommand('extension.reset', () => {
		item.command = 'extension.start';
		item.tooltip = 'start timer';
		clearTimerInterval();
		time = initTimer();
		itemText(MARK_START);
	});

	context.subscriptions.push(start);
	context.subscriptions.push(pause);
	context.subscriptions.push(reset);
}

export function deactivate() {}
