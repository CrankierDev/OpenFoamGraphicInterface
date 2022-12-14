# This is a sample Python script.

# Press Shift+F10 to execute it or replace it with your code.
# Press Double Shift to search everywhere for classes, files, tool windows, actions, and settings.
import command
import os
import shlex
import subprocess
import sys


def run(cmd):
    cmd = shlex.split(cmd)

    if cmd[0] == 'cd':
        try:
            os.chdir(cmd[1])
            return 0
        except OSError:
            print(str(sys.exc_info()[1]))
            return 1

    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)

    return proc.returncode


def startProcess():
    run("cd /home/linux/OpenFOAM/linux-8/run/pitzDaily")
    # res = command.run(['ls'])

    # print(res.output)
    # print(res.exit)

    res = command.run(['simpleFoam'])

    print(res.output)  # Coger output y pasarlo a un log o a BBDD.


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    startProcess()
# See PyCharm help at https://www.jetbrains.com/help/pycharm/
