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
    # os.system('wsl')
    # print("Shell changed")
    run("cd F:/OpenFoam/pitzDaily")
    # res = command.run(['ls'])
    print("At directory")
    # print(res.output)
    # print(res.exit)

    # command.run(['wsl'])
    # res = command.run(['simpleFoam'])

    res = os.system('simpleFoam')

    #print(res.output)  # Coger output y pasarlo a un log o a BBDD.

    print("Ready")

# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    print("Executing")
    startProcess()
# See PyCharm help at https://www.jetbrains.com/help/pycharm/
