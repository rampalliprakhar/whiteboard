import cx from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { MENU_OBJECTS } from "@/constant";
import { clickMenuObject, clickActionObject } from "@/slice/menuSlice";
import styles from "./index.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faEraser,
  faTrash,
  faRotateLeft,
  faRotateRight,
  faFileArrowDown,
} from "@fortawesome/free-solid-svg-icons";
const Menu = () => {
  const dispatch = useDispatch();
  const activeMenuObject = useSelector((state) => state.menu.activeMenuObject);

  const clickMenuHandler = (e, objectName) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(clickMenuObject(objectName));
  };

  const clickActionHandler = (e, objectName) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(clickActionObject(objectName));
  };

  return (
    <div className={styles.menuContainer}>
      <div
        className={cx(styles.iconWrapper, {
          [styles.active]: activeMenuObject === MENU_OBJECTS.PENCIL,
        })}
        onClick={(e) => {
          clickMenuHandler(e, MENU_OBJECTS.PENCIL);
        }}
      >
        <FontAwesomeIcon icon={faPencil} className={styles.icon} />
      </div>
      <div
        className={cx(styles.iconWrapper, {
          [styles.active]: activeMenuObject === MENU_OBJECTS.ERASER,
        })}
        onClick={(e) => {
          clickMenuHandler(e, MENU_OBJECTS.ERASER);
        }}
      >
        <FontAwesomeIcon icon={faEraser} className={styles.icon} />
      </div>
      <div
        className={cx(styles.iconWrapper)}
        onClick={(e) => {
          clickActionHandler(e, MENU_OBJECTS.UNDO);
        }}
      >
        <FontAwesomeIcon icon={faRotateLeft} className={styles.icon} />
      </div>
      <div
        className={cx(styles.iconWrapper)}
        onClick={(e) => {
          clickActionHandler(e, MENU_OBJECTS.REDO);
        }}
      >
        <FontAwesomeIcon icon={faRotateRight} className={styles.icon} />
      </div>
      <div
        className={cx(styles.iconWrapper)}
        onClick={(e) => {
          clickActionHandler(e, MENU_OBJECTS.CLEAR);
        }}
      >
        <FontAwesomeIcon icon={faTrash} className={styles.icon} />
      </div>
      <div
        className={cx(styles.iconWrapper)}
        onClick={(e) => {
          clickActionHandler(e, MENU_OBJECTS.SAVE);
        }}
      >
        <FontAwesomeIcon icon={faFileArrowDown} className={styles.icon} />
      </div>
    </div>
  );
};

export default Menu;
