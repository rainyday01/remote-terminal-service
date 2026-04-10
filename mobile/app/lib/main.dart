import 'package:flutter/material.dart';

void main() => runApp(const RemoteTerminalApp());

class RemoteTerminalApp extends StatelessWidget {
  const RemoteTerminalApp({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Remote Terminal',
      theme: ThemeData.light(),
      darkTheme: ThemeData.dark(),
      home: const Scaffold(
        appBar: AppBar(title: Text('Remote Terminal')),
        body: Center(child: Text('TODO: implement UI')), 
      ),
    );
  }
}
