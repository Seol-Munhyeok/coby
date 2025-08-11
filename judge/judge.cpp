#include <sys/user.h>

int call_counter[512];
void init_syscalls_limmits() {

}

void run_solution(char *work_dir){
    freopen("data.in","r",stdin);
    freopen("user.out","r",stdout);
    freopen("error.out","r",stderr);

    ptrace(PTRACE_TRACEME,0,NULL,NULL);

    chroot(work_dir);

    execl("./Main","./Main",(char *)NULL);
    exit(0);
}

void watch_solution(int pid) {
    int status, sig, exitcode;
    struct user_regs_struct reg;
    struct rusage ruse;
    int sub = 0;

    while(1){
        wait4(pid, &status, 0, &ruse);

        if(WIFEXITED(status)){
            break;
        }
        exitcode = WIFEXITED(status);

        if(exitcode == 0x05 || exitcode == 0) {
            //정상 흐름
        } else {
            // 비정상 흐름
        }
        if(WIFEXITED(status)) {
            // 시그널에 의한 흐름
            break;
        }
        ptrace(PTRACE_GETREGS,pid,NULL,&reg);

        if (call_counter[reg.orig_eax]) {
            // runtime error
            ptrace(PTRACE_KILL, pid, NULL, NULL);
        } else {
            if (call_counter[reg.orig_eax]>0){
                call_counter[reg.orig_eax] -= 1;
            }
        }
        ptrace(PTRACE_SYSCALL,pid,NULL,NULL);
    }
}

int main() {
    init_syscalls_limmits();
    int pid = fork();
    if(pid == 0) {
        run_solution();
    } else {
        watch_solution(pid);
    }
    return 0;
}