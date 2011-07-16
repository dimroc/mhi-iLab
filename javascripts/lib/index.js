/**
 * User: dimroc
 * Date: 7/16/11
 * Time: 11:37 AM
 */

function tryUpdatePopupPosition(e)
{

}

function touchStart(e)
{
  tryUpdatePopupPosition(e);
  e.preventDefault();

  return false;
}

function touchMove(e)
{
  tryUpdatePopupPosition(e);
  e.preventDefault();

  return false;
}

function touchEnd(e)
{
}