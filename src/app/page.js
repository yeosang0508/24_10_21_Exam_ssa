'use client';

import * as React from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Alert as MuiAlert,
  TextField,
  CssBaseline,
  Chip,
  Drawer,
  SwipeableDrawer,
  List,
  ListItem,
  Divider,
  ListItemButton,
  Modal,
  Snackbar,
  Alert,
  Box,
} from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import classNames from 'classnames';
import { RecoilRoot, atom, selector, useRecoilState, useRecoilValue } from 'recoil';
import { FaBars, FaCheck, FaEllipsisH, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { FaPenToSquare } from 'react-icons/fa6';
import dateToStr from './dateUtil';
import RootTheme from './theme';

const todosAtom = atom({
  key: 'app/todosAtom',
  default: [],
});

const lastTodoIdAtom = atom({
  key: 'app/lastTodoIdAtom',
  default: 0,
});


import { useState, useEffect, useRef, useCallback } from 'react';

function useTodosStatus() {
  const [todos, setTodos] = useState(() => {
    const savedTodos = JSON.parse(localStorage.getItem('todos')) || [];
    return savedTodos;
  });

  const [lastTodoId, setLastTodoId] = useState(() => {
    return JSON.parse(localStorage.getItem('lastTodoId')) || 0;
  });

  const lastTodoIdRef = useRef(lastTodoId);
  lastTodoIdRef.current = lastTodoId;

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
    localStorage.setItem('lastTodoId', JSON.stringify(lastTodoId));
  }, [todos, lastTodoId]);

  const addTodo = (newContent) => {
    const id = ++lastTodoIdRef.current;
    setLastTodoId(id);

    const newTodo = {
      id,
      content: newContent,
      regDate: new Date().toLocaleString(),
      isCompleted: false,
    };

    setTodos((prevTodos) => [newTodo, ...prevTodos]);
  };

  const removeTodo = (id) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  const toggleComplete = (id) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      )
    );
  };

  const editTodo = (id, newContent) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, content: newContent } : todo
      )
    );
  };

  return {
    todos,
    addTodo,
    removeTodo,
    toggleComplete,
    editTodo, // 반환에 포함
  };
}


const NewTodoForm = ({ onAddTodo }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim() === '') {
      alert('할 일을 입력하세요.');
      return;
    }
    onAddTodo(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="tw-flex tw-flex-col tw-p-4 tw-gap-2">
      <TextField
        multiline
        maxRows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        label="할 일 입력"
        variant="outlined"
        color="success"
        autoComplete="off"
      />
      <Button variant="outlined" color="success" type="submit">
        추가
      </Button>
    </form>
  );
};

const TodoListItem = ({ todo, toggleComplete, removeTodo, editTodo }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [newContent, setNewContent] = React.useState(todo.content);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (newContent.trim() === "") {
      alert("수정할 내용을 입력하세요.");
      return;
    }
    console.log(`Editing todo: ${todo.id}`); // 디버깅용 콘솔 출력
    editTodo(todo.id, newContent); // editTodo 호출
    setIsEditing(false); // 편집 모드 종료
  };

  return (
    <li className="tw-mb-3" key={todo.id}>
      <div className="tw-flex tw-flex-col tw-gap-2 tw-mt-3">
        <div className="tw-flex tw-gap-x-2 tw-font-bold">
          <Chip className="tw-pt-[3px]" label={`번호: ${todo.id}`} variant="outlined" />
          <Chip className="tw-pt-[3px]" label={`날짜: ${todo.regDate}`} color="success" />
        </div>

        <div className="tw-rounded-[10px] tw-shadow tw-flex tw-text-[14px] tw-min-h-[80px]">
          <Button
            onClick={() => toggleComplete(todo.id)}
            className="tw-flex-shrink-0 tw-rounded-[10px_0_0_10px]"
            color="inherit"
          >
            <FaCheck
              className={classNames(
                'tw-text-3xl',
                todo.isCompleted ? 'tw-text-green-500' : 'tw-text-gray-300'
              )}
            />
          </Button>

          <div className="tw-bg-gray-300 tw-w-[2px] tw-h-[60px] tw-self-center"></div>

          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="tw-flex tw-gap-2 tw-flex-grow">
              <TextField
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                variant="outlined"
                size="small"
                color="success"
                fullWidth
              />
              <Button type="submit" variant="contained" color="success">
                저장
              </Button>
            </form>
          ) : (
            <div
              className={classNames(
                'tw-flex tw-items-center tw-p-3 tw-flex-grow hover:tw-text-green-500',
                { 'tw-line-through': todo.isCompleted }
              )}
              onClick={() => setIsEditing(true)}
            >
              {todo.content}
            </div>
          )}

          <Button onClick={() => removeTodo(todo.id)} color="inherit">
            <FaTrash className="tw-text-gray-300 tw-text-2xl" />
          </Button>
        </div>
      </div>
    </li>
  );
};




// 해당 todo option에 대한 drawer 열기, 닫기
function useTodoOptionDrawerStatus() {
  const [todoId, setTodoId] = React.useState(null);
  const opened = React.useMemo(() => todoId !== null, [todoId]);

  const open = (id) => setTodoId(id);
  const close = () => setTodoId(null);
  return {
    todoId,
    open,
    close,
    opened,
  };
}

// modal 열기, 닫기
function useEditTodoModalStatus() {
  const [opened, setOpened] = React.useState(false);

  const open = () => {
    setOpened(true);
  };

  const close = () => {
    setOpened(false);
  };

  return {
    opened,
    open,
    close,
  };
}

function EditTodoModal({ status, todo, noticeSnackbarStatus }) {
  const todosStatus = useTodosStatus();
  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    form.content.value = form.content.value.trim();
    if (form.content.value.length == 0) {
      alert('할 일 써');
      form.content.focus();
      return;
    }
    // modify v1
    todosStatus.modifyTodo(todo.id, form.content.value);
    status.close();

    noticeSnackbarStatus.open(`${newTodoId}번 할 일이 추가되었습니다.`);


    // modify v2
    // todosStatus.modifyTodoById(todo.id, form.content.value);
  };
  return (
    <>
      <Modal
        open={status.opened}
        onClose={status.close}
        className="tw-flex tw-justify-center tw-items-center">
        <div className="tw-bg-white tw-p-10 tw-rounded-[20px] tw-w-full tw-max-w-lg">
          <form onSubmit={onSubmit} className="tw-flex tw-flex-col tw-gap-2">
            <TextField
              minRows={3}
              maxRows={10}
              multiline
              name="content"
              autoComplete="off"
              variant="outlined"
              label="할 일 써"
              defaultValue={todo?.content}
            />
            <Button variant="contained" className="tw-font-bold" type="submit">
              수정
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}

function TodoOptionDrawer({ status, noticeSnackbarStatus }) {
  const todosStatus = useTodosStatus();
  const removeTodo = () => {
    if (confirm(`${status.todoId}번 할 일을 삭제하시겠습니까?`) == false) {
      status.close();
      return;
    }
    todosStatus.removeTodo(status.todoId);
    status.close();
    noticeSnackbarStatus.open(`${status.todoId}번 todo 삭제됨`, 'error');
  };

  const editTodoModalStatus = useEditTodoModalStatus();

  const todo = todosStatus.findTodoById(status.todoId);

  return (
    <>
      <EditTodoModal
        status={editTodoModalStatus}
        todosStatus={todosStatus}
        todo={todo}
        noticeSnackbarStatus={noticeSnackbarStatus}
      />
      <SwipeableDrawer anchor="top" open={status.opened} onClose={status.close} onOpen={() => {}}>
        <List>
          <ListItem className="tw-flex tw-gap-2 tw-p-[15px]">
            <span className="tw-text-[--mui-color-primary-main]">{todo?.id}번</span>{' '}
            {/*옵셔널 체이닝*/}
            <span className="tw-text-[--mui-color-primary-main]">{status.todoId}번 </span>
            <span>Your Todo</span>
          </ListItem>
          <Divider className="tw-my-[5px]" />
          <ListItemButton
            onClick={editTodoModalStatus.open}
            className="tw-p-[15px_20px] tw-flex tw-gap-2 tw-items-center">
            <span>수정</span>
            <FaPenToSquare className="block tw-mt-[-5px]" />
          </ListItemButton>
          <ListItemButton
            className="tw-p-[15px_20px] tw-flex tw-gap-2 tw-items-center"
            onClick={removeTodo}>
            <span>삭제</span>
            <FaTrash className="block tw-mt-[-5px]" />
          </ListItemButton>
        </List>
      </SwipeableDrawer>
    </>
  );
}

const TodoList = ({ todos, onToggleComplete, onRemoveTodo, onEditTodo }) => {
  if (todos.length === 0) {
    return <p className="tw-text-center">할 일이 없습니다. 새 할 일을 추가하세요!</p>;
  }

  return (
    <List>
      {todos.map((todo) => (
        <TodoListItem
          key={todo.id}
          todo={todo}
          toggleComplete={onToggleComplete}
          removeTodo={onRemoveTodo}
          editTodo={onEditTodo} // 전달
        />
      ))}
    </List>
  );
};



const NoticeSnackbar = ({ message, onClose }) => (
  <Snackbar open={!!message} autoHideDuration={3000} onClose={onClose}>
    <Alert severity="success">{message}</Alert>
  </Snackbar>
);

function useNoticeSnackbarStatus() {
  const [opened, setOpened] = React.useState(false);
  const [autoHideDuration, setAutoHideDuration] = React.useState(null);
  const [variant, setVariant] = React.useState(null);
  const [severity, setSeverity] = React.useState(null);
  const [msg, setMsg] = React.useState(null);
  const open = (msg, severity = 'success', autoHideDuration = 3000, variant = 'filled') => {
    setOpened(true);
    setMsg(msg);
    setSeverity(severity);
    setAutoHideDuration(autoHideDuration);
    setVariant(variant);
  };
  const close = () => {
    setOpened(false);
  };
  return {
    opened,
    open,
    close,
    autoHideDuration,
    variant,
    severity,
    msg,
  };
}

const App = () => {
  const { todos, addTodo, removeTodo, toggleComplete, editTodo } = useTodosStatus(); // editTodo 포함
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleAddTodo = (content) => {
    addTodo(content);
    setSnackbarMessage('할 일이 추가되었습니다!');
  };

  const handleCloseSnackbar = () => setSnackbarMessage('');

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: '#4caf50' }}>
        <Toolbar>
          <FaBars className="tw-cursor-pointer" />
          <div className="tw-flex-1 tw-text-center">로고</div>
        </Toolbar>
      </AppBar>
      <Toolbar />

      <NoticeSnackbar message={snackbarMessage} onClose={handleCloseSnackbar} />

      <NewTodoForm onAddTodo={handleAddTodo} />

      <TodoList
        todos={todos}
        onToggleComplete={toggleComplete}
        onRemoveTodo={removeTodo}
        onEditTodo={editTodo} // 전달
      />
    </>
  );
};


export default function ThemeApp() {
  const theme = RootTheme();

  return (
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </RecoilRoot>
  );
}