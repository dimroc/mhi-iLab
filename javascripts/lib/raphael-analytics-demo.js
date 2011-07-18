Raphael.fn.drawGrid = function (x, y, w, h, wv, hv, color)
{
  color = color || "#000";
  var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L", Math.round(x + w) + .5, Math.round(y) + .5, Math.round(x + w) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y) + .5],
      rowHeight = h / hv,
      columnWidth = w / wv;
  for (var i = 1; i < hv; i++)
  {
    path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + w) + .5]);
  }
  for (i = 1; i < wv; i++)
  {
    path = path.concat(["M", Math.round(x + i * columnWidth) + .5, Math.round(y) + .5, "V", Math.round(y + h) + .5]);
  }
  return this.path(path.join(",")).attr({stroke: color});
};

$(function ()
{
  $("#data").css({
    position: "absolute",
    left: "-9999em",
    top: "-9999em"
  });
});

main_paper = new Object();
popup_invocations = [];

// Draw
var main_paper_width = 800,
    main_paper_height = 250;

var is_label_visible = false, leave_timer;
var previous_invocation;

find_closest_invocation = function(x)
{
  var invocation;
  var minX = 100000;
  for (var i = 0; i<popup_invocations.length; i++)
  {
    var cur = popup_invocations[i];

    // For now we are only checking x.
    var curDiffX = Math.abs(x - cur.dot.x);
    if (curDiffX < minX)
    {
      minX = curDiffX;
      invocation = cur;
    }
  }

  return invocation;
};

tryUpdatePopup = function (x)
{
  if(previous_invocation)
  {
    // previous_invocation.hoverOff();
  }

  var invocation = find_closest_invocation(x);
  if(invocation && invocation != previous_invocation)
  {
    invocation.hoverOn();
    previous_invocation = invocation;
  }
};

activate_popup = function(x, y, data, lbl, dot, frame, label)
{
  return (function ()
  {
    clearTimeout(leave_timer);
    var side = "right";
    if (x + frame.getBBox().width > main_paper_width)
    {
      side = "left";
    }
    var ppp = main_paper.popup(x, y, label, side, 1);
    frame.show().stop().animate({path: ppp.path}, 200 * is_label_visible);
    label[0].attr({text: data + " hit" + (data == 1 ? "" : "s")}).show().stop().animateWith(frame, {translation: [ppp.dx, ppp.dy]}, 200 * is_label_visible);
    label[1].attr({text: lbl + " September 2008"}).show().stop().animateWith(frame, {translation: [ppp.dx, ppp.dy]}, 200 * is_label_visible);
    dot.attr("r", 6); // TODO: to investigate
    is_label_visible = true;
  });
};

deactivate_popup = function (dot, frame, label)
{
  return (function()
  {
    dot.attr("r", 4);
    // TODO: to investigate
    leave_timer = setTimeout(function ()
    {
      frame.hide();
      label[0].hide();
      label[1].hide();
      is_label_visible = false;
    }, 1);
  });
};

render_chart = function ()
{
  function getAnchors(p1x, p1y, p2x, p2y, p3x, p3y)
  {
    var l1 = (p2x - p1x) / 2,
        l2 = (p3x - p2x) / 2,
        a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y)),
        b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));
    a = p1y < p2y ? Math.PI - a : a;
    b = p3y < p2y ? Math.PI - b : b;
    var alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2,
        dx1 = l1 * Math.sin(alpha + a),
        dy1 = l1 * Math.cos(alpha + a),
        dx2 = l2 * Math.sin(alpha + b),
        dy2 = l2 * Math.cos(alpha + b);
    return {
      x1: p2x - dx1,
      y1: p2y + dy1,
      x2: p2x + dx2,
      y2: p2y + dy2
    };
  }

  // Grab the data
  var labels = [],
      data = [];
  $("#data tfoot th").each(function ()
  {
    labels.push($(this).html());
  });
  $("#data tbody td").each(function ()
  {
    data.push($(this).html());
  });

  main_paper = new Raphael($(".holder").last()[0], main_paper_width, main_paper_height);

  var leftgutter = 30,
      bottomgutter = 20,
      topgutter = 20,
      colorhue = .6 || Math.random(),
      color = "hsb(" + [colorhue, .5, 1] + ")",
      txt = {font: '12px Helvetica, Arial', fill: "#fff"},
      txt1 = {font: '10px Helvetica, Arial', fill: "#fff"},
      txt2 = {font: '12px Helvetica, Arial', fill: "#000"},
      X = (main_paper_width - leftgutter) / labels.length,
      max = Math.max.apply(Math, data),
      Y = (main_paper_height - bottomgutter - topgutter) / max;
  main_paper.drawGrid(leftgutter + X * .5 + .5, topgutter + .5, main_paper_width - leftgutter - X, main_paper_height - topgutter - bottomgutter, 10, 10, "#333");
  var path = main_paper.path().attr({stroke: color, "stroke-width": 4, "stroke-linejoin": "round"}),
      bgp = main_paper.path().attr({stroke: "none", opacity: .3, fill: color}),
      label = main_paper.set(),
      blanket = main_paper.set();
  label.push(main_paper.text(60, 12, "24 hits").attr(txt));
  label.push(main_paper.text(60, 27, "22 September 2008").attr(txt1).attr({fill: color}));
  label.hide();
  var frame = main_paper.popup(100, 100, label, "right").attr({fill: "#000", stroke: "#666", "stroke-width": 2, "fill-opacity": .7}).hide();

  var p, bgpp;
  for (var i = 0, ii = labels.length; i < ii; i++)
  {
    var y = Math.round(main_paper_height - bottomgutter - Y * data[i]),
        x = Math.round(leftgutter + X * (i + .5)),
        t = main_paper.text(x, main_paper_height - 6, labels[i]).attr(txt).toBack();
    if (!i)
    {
      p = ["M", x, y, "C", x, y];
      bgpp = ["M", leftgutter + X * .5, main_paper_height - bottomgutter, "L", x, y, "C", x, y];
    }
    if (i && i < ii - 1)
    {
      var Y0 = Math.round(main_paper_height - bottomgutter - Y * data[i - 1]),
          X0 = Math.round(leftgutter + X * (i - .5)),
          Y2 = Math.round(main_paper_height - bottomgutter - Y * data[i + 1]),
          X2 = Math.round(leftgutter + X * (i + 1.5));
      var a = getAnchors(X0, Y0, x, y, X2, Y2);
      p = p.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
      bgpp = bgpp.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
    }
    var dot = main_paper.circle(x, y, 4).attr({fill: "#000", stroke: color, "stroke-width": 2});
    dot.x = x;
    dot.y = y;
    blanket.push(main_paper.rect(leftgutter + X * i, 0, X, main_paper_height - bottomgutter).attr({stroke: "none", fill: "#fff", opacity: 0}));
    var rect = blanket[blanket.length - 1];

    // rect.hover(activate_popup(x, y, data[i], labels[i], dot, frame, label), deactivate_popup(dot, frame, label));
    popup_invocations.push(
        {
          dot: dot,
          hoverOn: activate_popup(x, y, data[i], labels[i], dot, frame, label),
          hoverOff: deactivate_popup(dot, frame, label)
        });
  }

  //main_paper.canvas.onmousemove(main_paper_hover_on(event), main_paper_hover_off(event));

  p = p.concat([x, y, x, y]);
  bgpp = bgpp.concat([x, y, x, y, "L", x, main_paper_height - bottomgutter, "z"]);
  path.attr({path: p});
  bgp.attr({path: bgpp});
  frame.toFront();
  label[0].toFront();
  label[1].toFront();
  blanket.toFront();
};

clear_chart = function()
{
  $(".holder").empty();
};

function save()
{
  // Dispatch svg chart from client to back-end and have it rendered elsewhere.

  // Display prompt with link to saved chart.
  // TODO:
}

